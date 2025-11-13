import type { PrescriptionInput, PrescriptionResult } from '$lib/types/prescription';
import { validateInput } from '$lib/utils/validators';
import { normalizeDrugName, getRelatedDrugs } from '$lib/utils/api/rxnorm';
import { getNdcsByDrugName, getNdcsByNdc } from '$lib/utils/api/fda-ndc';
import { parseSig } from '$lib/utils/sig-parser';
import { calculateTotalQuantity, findOptimalNdcs, detectDosageFormType } from '$lib/utils/calculations';

/**
 * Client-side version of the calculate API endpoint
 * This replaces the server-side /api/calculate route for static deployments
 */
export async function calculatePrescription(
	input: PrescriptionInput
): Promise<PrescriptionResult | { error: string; message: string }> {
	try {
		// Validate input
		const validation = validateInput(input);
		if (!validation.isValid) {
			return {
				error: 'VALIDATION_ERROR',
				message: 'Invalid input',
				...(validation.errors && { errors: validation.errors })
			};
		}

		const warnings: string[] = [];
		let rxcui: string | undefined;
		let drugName = input.drugName || 'Unknown Drug';
		let ndcs: any[] = [];

		// Normalize drug name if provided (but keep original name for display)
		if (input.drugName) {
			// Try to normalize with RxNorm first
			const normResult = await normalizeDrugName(input.drugName);
			if (!('error' in normResult)) {
				rxcui = normResult.rxcui;
			}
			
			// Keep original drug name for display
			drugName = input.drugName;

			// Try multiple search strategies
			let ndcResult = await getNdcsByDrugName(input.drugName);
			
			// If search fails, try related drugs from RxNorm
			if (!Array.isArray(ndcResult) && rxcui) {
				const relatedResult = await getRelatedDrugs(rxcui);
				if (Array.isArray(relatedResult)) {
					// Try related drug names (brand names, ingredients, etc.)
					for (const relatedDrug of relatedResult.slice(0, 5)) {
						const relatedSearch = await getNdcsByDrugName(relatedDrug.name);
						if (Array.isArray(relatedSearch) && relatedSearch.length > 0) {
							ndcs = relatedSearch;
							drugName = relatedDrug.name; // Update to the name that worked
							warnings.push(`Found NDCs using related drug name: "${relatedDrug.name}"`);
							break;
						}
					}
				}
			}
			
			// If still no results, try normalized name from RxNorm
			if (ndcs.length === 0 && !('error' in normResult) && normResult.normalizedName !== input.drugName) {
				const normalizedSearch = await getNdcsByDrugName(normResult.normalizedName);
				if (Array.isArray(normalizedSearch) && normalizedSearch.length > 0) {
					ndcs = normalizedSearch;
					drugName = normResult.normalizedName;
					warnings.push(`Found NDCs using normalized name: "${normResult.normalizedName}"`);
				}
			}
			
			// Final check - if we have results, use them
			if (Array.isArray(ndcResult) && ndcResult.length > 0) {
				ndcs = ndcResult;
			}
			
			// If still no results, provide helpful error message
			if (ndcs.length === 0) {
				let suggestionText = '\n\nSuggestions:\n';
				suggestionText += '- Try searching with just the brand name (e.g., "Humalog" instead of "Humalog Insulin")\n';
				suggestionText += '- Remove descriptive words like "insulin", "tablet", "capsule"\n';
				suggestionText += '- Try the generic name instead of brand name (or vice versa)\n';
				suggestionText += '- Use a specific NDC code if you have it';
				
				// Add related drug suggestions if available
				if (rxcui) {
					const relatedResult = await getRelatedDrugs(rxcui);
					if (Array.isArray(relatedResult) && relatedResult.length > 0) {
						suggestionText += '\n\nRelated drugs you could try:\n';
						relatedResult.slice(0, 5).forEach(drug => {
							suggestionText += `- ${drug.name}\n`;
						});
					}
				}
				
				return {
					error: 'NDC_LOOKUP_ERROR',
					message: `No NDCs found for "${input.drugName}".${suggestionText}`
				};
			}
		} else if (input.ndc) {
			// Get NDCs by NDC code
			const ndcResult = await getNdcsByNdc(input.ndc);
			if (Array.isArray(ndcResult)) {
				ndcs = ndcResult;
				if (ndcs.length > 0) {
					drugName = ndcs[0].productName;
				} else {
					return {
						error: 'NO_NDCS_FOUND',
						message: `No NDCs found for the provided NDC code: ${input.ndc}. Please verify the NDC code is correct.`
					};
				}
			} else {
				return {
					error: 'NDC_LOOKUP_ERROR',
					message: ndcResult.message || `Failed to lookup NDC code: ${input.ndc}`
				};
			}
		}

		if (ndcs.length === 0) {
			let errorMessage = `No NDCs found for "${drugName}".`;
			
			// Provide context-specific suggestions
			if (input.drugName) {
				errorMessage += '\n\nSuggestions:\n';
				errorMessage += '- Try searching with just the brand name (e.g., "Humalog" instead of "Humalog Insulin")\n';
				errorMessage += '- Remove descriptive words like "insulin", "tablet", "capsule", "liquid"\n';
				errorMessage += '- Try the generic name instead of brand name (or vice versa)\n';
				errorMessage += '- Check spelling and try common variations';
			} else if (input.ndc) {
				errorMessage += '\n\nSuggestions:\n';
				errorMessage += '- Verify the NDC code is correct (format: 12345-678-90 or 1234567890)\n';
				errorMessage += '- Try searching by drug name instead';
			}
			
			return {
				error: 'NO_NDCS_FOUND',
				message: errorMessage
			};
		}

		// Parse SIG
		const parsedSig = parseSig(input.sig);
		if (!parsedSig) {
			return {
				error: 'SIG_PARSE_ERROR',
				message: `Failed to parse SIG: "${input.sig}"\n\nValid formats:\n- "Take 1 tablet twice daily"\n- "1 tablet daily"\n- "Take 2 capsules every 12 hours"\n- "Inject 10 units before meals"\n\nMake sure to include:\n- Quantity (e.g., "1", "2", "5 mL")\n- Unit (e.g., "tablet", "capsule", "mL", "unit")\n- Frequency (e.g., "daily", "twice daily", "every 12 hours")`
			};
		}

		// Detect dosage form type from first NDC (if available)
		const dosageFormType = ndcs.length > 0 
			? detectDosageFormType(ndcs[0].dosageForm, parsedSig.unit)
			: undefined;

		// Calculate total quantity with special dosage form handling
		const totalQuantity = calculateTotalQuantity(parsedSig, input.daysSupply, dosageFormType);
		const unit = parsedSig.unit;

		// Find optimal NDCs
		const matchedNdcs = findOptimalNdcs(totalQuantity, ndcs);

		if (matchedNdcs.length === 0) {
			return {
				error: 'NO_MATCHES_FOUND',
				message: `No matching NDCs found for the calculated quantity (${totalQuantity} ${unit}).\n\nThis could mean:\n- The required quantity is very large or unusual\n- All available NDCs are inactive\n- Try adjusting the days supply or SIG if possible`
			};
		}

		// Check for inactive NDCs
		const inactiveCount = matchedNdcs.filter((ndc) => !ndc.isActive).length;
		if (inactiveCount > 0) {
			warnings.push(`${inactiveCount} inactive NDC(s) found. Please verify before use.`);
		}

		// Check for overfills
		const overfillCount = matchedNdcs.filter((ndc) => ndc.overfill && ndc.overfill > 0).length;
		if (overfillCount > 0) {
			warnings.push(`${overfillCount} NDC(s) have overfill. Consider alternatives if available.`);
		}

		// Get related drugs if we have RxCUI
		let relatedDrugs;
		if (rxcui) {
			const relatedResult = await getRelatedDrugs(rxcui);
			if (Array.isArray(relatedResult)) {
				// Filter out current drug if it appears in related drugs
				relatedDrugs = relatedResult.filter(d => d.rxcui !== rxcui);
			}
		}

		const result: PrescriptionResult = {
			rxcui,
			drugName,
			totalQuantity,
			unit,
			matchedNdcs,
			relatedDrugs,
			warnings
		};

		return result;
	} catch (error) {
		return {
			error: 'SERVER_ERROR',
			message: error instanceof Error ? error.message : 'An unexpected error occurred'
		};
	}
}

