import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { PrescriptionInput, PrescriptionResult } from '$lib/types/prescription';
import { validateInput } from '$lib/utils/validators';
import { normalizeDrugName, getRelatedDrugs } from '$lib/utils/api/rxnorm';
import { getNdcsByDrugName, getNdcsByNdc } from '$lib/utils/api/fda-ndc';
import { parseSig } from '$lib/utils/sig-parser';
import { calculateTotalQuantity, findOptimalNdcs } from '$lib/utils/calculations';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const input: PrescriptionInput = await request.json();

		// Validate input
		const validation = validateInput(input);
		if (!validation.isValid) {
			return json(
				{
					error: 'VALIDATION_ERROR',
					message: 'Invalid input',
					errors: validation.errors
				},
				{ status: 400 }
			);
		}

		const warnings: string[] = [];
		let rxcui: string | undefined;
		let drugName = input.drugName || 'Unknown Drug';
		let ndcs: any[] = [];

		// Normalize drug name if provided (but keep original name for display)
		if (input.drugName) {
			const normResult = await normalizeDrugName(input.drugName);
			if ('error' in normResult) {
				return json(
					{
						error: 'NORMALIZATION_ERROR',
						message: normResult.message
					},
					{ status: 400 }
				);
			}
			rxcui = normResult.rxcui;
			// Keep original drug name, don't normalize
			drugName = input.drugName;

			// Get NDCs by drug name (FDA API doesn't support RxCUI search)
			const ndcResult = await getNdcsByDrugName(drugName);
			if (Array.isArray(ndcResult)) {
				ndcs = ndcResult;
			} else {
				// If search by normalized name fails, try original drug name
				if (ndcResult.statusCode === 404 && input.drugName !== drugName) {
					const fallbackResult = await getNdcsByDrugName(input.drugName);
					if (Array.isArray(fallbackResult)) {
						ndcs = fallbackResult;
					} else {
						return json(
							{
								error: 'NDC_LOOKUP_ERROR',
								message: fallbackResult.message || 'No NDCs found for this drug name'
							},
							{ status: 404 }
						);
					}
				} else {
					return json(
						{
							error: 'NDC_LOOKUP_ERROR',
							message: ndcResult.message || 'No NDCs found for this drug name'
						},
						{ status: 404 }
					);
				}
			}
		} else if (input.ndc) {
			// Get NDCs by NDC code
			const ndcResult = await getNdcsByNdc(input.ndc);
			if (Array.isArray(ndcResult)) {
				ndcs = ndcResult;
				if (ndcs.length > 0) {
					drugName = ndcs[0].productName;
				} else {
					return json(
						{
							error: 'NO_NDCS_FOUND',
							message: `No NDCs found for the provided NDC code: ${input.ndc}. Please verify the NDC code is correct.`
						},
						{ status: 404 }
					);
				}
			} else {
				return json(
					{
						error: 'NDC_LOOKUP_ERROR',
						message: ndcResult.message || `Failed to lookup NDC code: ${input.ndc}`
					},
					{ status: 400 }
				);
			}
		}

		if (ndcs.length === 0) {
			return json(
				{
					error: 'NO_NDCS_FOUND',
					message: 'No NDCs found for the provided drug name or NDC code'
				},
				{ status: 404 }
			);
		}

		// Parse SIG
		const parsedSig = parseSig(input.sig);
		if (!parsedSig) {
			return json(
				{
					error: 'SIG_PARSE_ERROR',
					message: 'Failed to parse SIG format'
				},
				{ status: 400 }
			);
		}

		// Calculate total quantity
		const totalQuantity = calculateTotalQuantity(parsedSig, input.daysSupply);

		// Find optimal NDCs
		const matchedNdcs = findOptimalNdcs(totalQuantity, ndcs);

		if (matchedNdcs.length === 0) {
			return json(
				{
					error: 'NO_MATCHES_FOUND',
					message: 'No matching NDCs found for the calculated quantity'
				},
				{ status: 404 }
			);
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
			unit: parsedSig.unit,
			matchedNdcs,
			relatedDrugs,
			warnings
		};

		return json(result);
	} catch (error) {
		return json(
			{
				error: 'SERVER_ERROR',
				message: error instanceof Error ? error.message : 'An unexpected error occurred'
			},
			{ status: 500 }
		);
	}
};

