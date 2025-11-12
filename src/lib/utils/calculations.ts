import type { ParsedSig } from '$lib/types/prescription';
import type { NDC, MatchedNDC } from '$lib/types/ndc';

/**
 * Calculate total quantity needed based on parsed SIG and days supply
 */
export function calculateTotalQuantity(parsedSig: ParsedSig, daysSupply: number): number {
	return Math.ceil(parsedSig.quantity * parsedSig.frequency * daysSupply);
}

/**
 * Find optimal NDC matches for the required quantity
 * Algorithm:
 * 1. Find exact matches (package size = quantity needed)
 * 2. Find single-pack matches with minimal overfill
 * 3. Find multi-pack combinations with minimal overfill
 * 4. Mark optimal matches (exact or minimal overfill)
 */
export function findOptimalNdcs(quantity: number, ndcs: NDC[]): MatchedNDC[] {
	if (ndcs.length === 0) {
		return [];
	}

	const matched: MatchedNDC[] = [];

	for (const ndc of ndcs) {
		// Calculate how many packages are needed
		const packagesNeeded = Math.ceil(quantity / ndc.packageSize);
		const totalQuantity = packagesNeeded * ndc.packageSize;
		const overfill = totalQuantity - quantity;
		const underfill = quantity > totalQuantity ? 0 : quantity - totalQuantity;

		// Determine if this is optimal (exact match or minimal overfill)
		const isOptimal = overfill === 0 || (overfill > 0 && overfill <= ndc.packageSize * 0.1); // Within 10% overfill

		matched.push({
			...ndc,
			quantityNeeded: quantity,
			packagesNeeded,
			overfill: overfill > 0 ? overfill : undefined,
			underfill: underfill > 0 ? underfill : undefined,
			isOptimal
		});
	}

	// Sort by optimal first, then by overfill amount
	matched.sort((a, b) => {
		// Optimal matches first
		if (a.isOptimal && !b.isOptimal) return -1;
		if (!a.isOptimal && b.isOptimal) return 1;

		// Then by overfill (lower is better)
		const aOverfill = a.overfill || 0;
		const bOverfill = b.overfill || 0;
		if (aOverfill !== bOverfill) {
			return aOverfill - bOverfill;
		}

		// Then by packages needed (fewer is better)
		return a.packagesNeeded - b.packagesNeeded;
	});

	return matched;
}

