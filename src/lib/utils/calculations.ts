import type { ParsedSig } from '$lib/types/prescription';
import type { NDC, MatchedNDC, MultiPackCombination } from '$lib/types/ndc';

/**
 * Detect dosage form type for special handling
 */
export type DosageFormType = 'tablet' | 'capsule' | 'liquid' | 'insulin' | 'inhaler' | 'other';

export function detectDosageFormType(dosageForm: string, unit: string): DosageFormType {
	const form = dosageForm.toLowerCase();
	const unitLower = unit.toLowerCase();

	// Insulin detection
	if (
		form.includes('insulin') ||
		form.includes('pen') ||
		unitLower.includes('unit') ||
		unitLower === 'u' ||
		unitLower === 'iu'
	) {
		return 'insulin';
	}

	// Inhaler detection
	if (
		form.includes('inhaler') ||
		form.includes('aerosol') ||
		form.includes('spray') ||
		unitLower.includes('puff') ||
		unitLower.includes('actuation')
	) {
		return 'inhaler';
	}

	// Liquid detection
	if (
		form.includes('liquid') ||
		form.includes('solution') ||
		form.includes('suspension') ||
		form.includes('syrup') ||
		form.includes('elixir') ||
		unitLower.includes('ml') ||
		unitLower.includes('l') ||
		unitLower.includes('fl oz')
	) {
		return 'liquid';
	}

	// Tablet/Capsule detection
	if (form.includes('tablet') || unitLower.includes('tablet')) {
		return 'tablet';
	}
	if (form.includes('capsule') || unitLower.includes('capsule')) {
		return 'capsule';
	}

	return 'other';
}

/**
 * Calculate total quantity needed based on parsed SIG and days supply
 * Handles special dosage forms with appropriate calculations
 */
export function calculateTotalQuantity(
	parsedSig: ParsedSig,
	daysSupply: number,
	dosageFormType?: DosageFormType
): number {
	let baseQuantity = parsedSig.quantity * parsedSig.frequency * daysSupply;

	// Special handling for different dosage forms
	switch (dosageFormType) {
		case 'insulin':
			// Insulin is typically rounded to nearest unit
			return Math.round(baseQuantity);
		case 'inhaler':
			// Inhalers: round up to nearest full canister/puff
			return Math.ceil(baseQuantity);
		case 'liquid':
			// Liquids: round to 2 decimal places, then round up for practical dispensing
			return Math.ceil(Math.round(baseQuantity * 100) / 100);
		default:
			// Tablets, capsules: round up
			return Math.ceil(baseQuantity);
	}
}

/**
 * Find optimal multi-pack combinations
 * Tries combinations of 2-3 different package sizes to minimize overfill
 */
function findMultiPackCombinations(
	quantity: number,
	ndcs: NDC[],
	maxResults: number = 5
): MultiPackCombination[][] {
	const combinations: Array<{ combo: MultiPackCombination[]; total: number; overfill: number }> = [];

	// Only consider active NDCs with same unit
	const activeNdcs = ndcs.filter((ndc) => ndc.isActive);
	if (activeNdcs.length < 2) return []; // Need at least 2 different sizes

	// Group by package size and get unique sizes
	const sizeGroups = new Map<number, NDC[]>();
	for (const ndc of activeNdcs) {
		if (!sizeGroups.has(ndc.packageSize)) {
			sizeGroups.set(ndc.packageSize, []);
		}
		sizeGroups.get(ndc.packageSize)!.push(ndc);
	}

	const uniqueSizes = Array.from(sizeGroups.keys()).sort((a, b) => b - a);

	// Try 2-pack combinations
	for (let i = 0; i < uniqueSizes.length; i++) {
		for (let j = i + 1; j < uniqueSizes.length; j++) {
			const size1 = uniqueSizes[i];
			const size2 = uniqueSizes[j];
			const ndc1 = sizeGroups.get(size1)![0];
			const ndc2 = sizeGroups.get(size2)![0];

			// Try different quantities of each
			for (let qty1 = 0; qty1 <= Math.ceil(quantity / size1) + 1; qty1++) {
				const remaining = quantity - qty1 * size1;
				if (remaining < 0) break;
				const qty2 = Math.ceil(remaining / size2);

				const total = qty1 * size1 + qty2 * size2;
				const overfill = total - quantity;

				// Only consider if overfill is reasonable (within 20% of quantity)
				if (overfill >= 0 && overfill <= quantity * 0.2 && qty1 > 0 && qty2 > 0) {
					combinations.push({
						combo: [
							{ ndc: ndc1, packages: qty1 },
							{ ndc: ndc2, packages: qty2 }
						],
						total,
						overfill
					});
				}
			}
		}
	}

	// Try 3-pack combinations (if 2-pack doesn't give good results)
	if (combinations.length < 3 && uniqueSizes.length >= 3) {
		for (let i = 0; i < uniqueSizes.length; i++) {
			for (let j = i + 1; j < uniqueSizes.length; j++) {
				for (let k = j + 1; k < uniqueSizes.length; k++) {
					const size1 = uniqueSizes[i];
					const size2 = uniqueSizes[j];
					const size3 = uniqueSizes[k];
					const ndc1 = sizeGroups.get(size1)![0];
					const ndc2 = sizeGroups.get(size2)![0];
					const ndc3 = sizeGroups.get(size3)![0];

					// Try limited combinations (to avoid explosion)
					for (let qty1 = 0; qty1 <= 3; qty1++) {
						for (let qty2 = 0; qty2 <= 3; qty2++) {
							const remaining = quantity - qty1 * size1 - qty2 * size2;
							if (remaining < 0) break;
							const qty3 = Math.ceil(remaining / size3);

							const total = qty1 * size1 + qty2 * size2 + qty3 * size3;
							const overfill = total - quantity;

							if (overfill >= 0 && overfill <= quantity * 0.2 && qty1 > 0 && qty2 > 0 && qty3 > 0) {
								combinations.push({
									combo: [
										{ ndc: ndc1, packages: qty1 },
										{ ndc: ndc2, packages: qty2 },
										{ ndc: ndc3, packages: qty3 }
									],
									total,
									overfill
								});
							}
						}
					}
				}
			}
		}
	}

	// Sort by overfill, then by total packages
	combinations.sort((a, b) => {
		if (a.overfill !== b.overfill) return a.overfill - b.overfill;
		const aPackages = a.combo.reduce((sum, c) => sum + c.packages, 0);
		const bPackages = b.combo.reduce((sum, c) => sum + c.packages, 0);
		return aPackages - bPackages;
	});

	// Return top results
	return combinations.slice(0, maxResults).map((c) => c.combo);
}

/**
 * Find optimal NDC matches for the required quantity
 * Enhanced algorithm with multi-pack optimization and special dosage form handling
 */
export function findOptimalNdcs(quantity: number, ndcs: NDC[]): MatchedNDC[] {
	if (ndcs.length === 0) {
		return [];
	}

	const matched: MatchedNDC[] = [];

	// Detect dosage form type from first NDC (assuming all NDCs for same drug have similar forms)
	const dosageFormType = detectDosageFormType(ndcs[0]?.dosageForm || '', ndcs[0]?.unit || '');

	// 1. Single-pack matches (existing logic)
	for (const ndc of ndcs) {
		const packagesNeeded = Math.ceil(quantity / ndc.packageSize);
		const totalQuantity = packagesNeeded * ndc.packageSize;
		const overfill = totalQuantity - quantity;
		const underfill = quantity > totalQuantity ? 0 : quantity - totalQuantity;

		// Determine if this is optimal (exact match or minimal overfill)
		const isOptimal = overfill === 0 || (overfill > 0 && overfill <= ndc.packageSize * 0.1);

		matched.push({
			...ndc,
			quantityNeeded: quantity,
			packagesNeeded,
			overfill: overfill > 0 ? overfill : undefined,
			underfill: underfill > 0 ? underfill : undefined,
			isOptimal
		});
	}

	// 2. Multi-pack combinations (only for tablets/capsules with multiple package sizes)
	if (dosageFormType === 'tablet' || dosageFormType === 'capsule') {
		const multiPackCombos = findMultiPackCombinations(quantity, ndcs, 5);

		for (const combo of multiPackCombos) {
			if (combo.length > 1) {
				// Only add if it's a true multi-pack (multiple different sizes)
				const totalQuantity = combo.reduce((sum, c) => sum + c.ndc.packageSize * c.packages, 0);
				const overfill = totalQuantity - quantity;
				const totalPackages = combo.reduce((sum, c) => sum + c.packages, 0);

				// Use the first NDC as the primary one for display
				const primaryNdc = combo[0].ndc;

				matched.push({
					...primaryNdc,
					quantityNeeded: quantity,
					packagesNeeded: totalPackages,
					overfill: overfill > 0 ? overfill : undefined,
					underfill: undefined,
					isOptimal: overfill === 0 || (overfill > 0 && overfill <= quantity * 0.05), // 5% tolerance for multi-pack
					multiPack: combo
				});
			}
		}
	}

	// 3. Sort results
	matched.sort((a, b) => {
		// Exact matches first
		const aExact = (a.overfill || 0) === 0;
		const bExact = (b.overfill || 0) === 0;
		if (aExact && !bExact) return -1;
		if (!aExact && bExact) return 1;

		// Optimal matches next
		if (a.isOptimal && !b.isOptimal) return -1;
		if (!a.isOptimal && b.isOptimal) return 1;

		// Then by overfill (lower is better)
		const aOverfill = a.overfill || 0;
		const bOverfill = b.overfill || 0;
		if (aOverfill !== bOverfill) {
			return aOverfill - bOverfill;
		}

		// Multi-pack combinations prioritized if they're exact matches
		if (a.multiPack && !b.multiPack && aOverfill === 0) return -1;
		if (!a.multiPack && b.multiPack && bOverfill === 0) return 1;

		// Then by packages needed (fewer is better)
		return a.packagesNeeded - b.packagesNeeded;
	});

	return matched;
}
