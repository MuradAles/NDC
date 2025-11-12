import type { ParsedSig } from '$lib/types/prescription';

/**
 * Parse SIG (prescription instructions) to extract quantity, frequency, and unit
 * Examples:
 * - "Take 1 tablet by mouth twice daily" -> { quantity: 1, frequency: 2, unit: "tablet" }
 * - "Take 2 capsules every 12 hours" -> { quantity: 2, frequency: 2, unit: "capsule" }
 * - "1 tablet daily" -> { quantity: 1, frequency: 1, unit: "tablet" }
 */
export function parseSig(sig: string): ParsedSig | null {
	if (!sig || typeof sig !== 'string') {
		return null;
	}

	const normalizedSig = sig.trim().toLowerCase();

	// Extract quantity (number before unit)
	const quantityMatch = normalizedSig.match(/(\d+(?:\.\d+)?)\s*(tablet|tablets|capsule|capsules|ml|mg|g|unit|units|dose|doses)/i);
	if (!quantityMatch) {
		return null;
	}

	const quantity = parseFloat(quantityMatch[1]);
	const unit = quantityMatch[2].toLowerCase().replace(/s$/, ''); // Remove plural

	// Extract frequency
	let frequency = 1; // Default to once daily

	// Patterns for frequency
	if (normalizedSig.includes('twice daily') || normalizedSig.includes('twice a day') || normalizedSig.includes('bid')) {
		frequency = 2;
	} else if (normalizedSig.includes('three times daily') || normalizedSig.includes('three times a day') || normalizedSig.includes('tid')) {
		frequency = 3;
	} else if (normalizedSig.includes('four times daily') || normalizedSig.includes('four times a day') || normalizedSig.includes('qid')) {
		frequency = 4;
	} else if (normalizedSig.includes('every 12 hours') || normalizedSig.includes('q12h')) {
		frequency = 2;
	} else if (normalizedSig.includes('every 8 hours') || normalizedSig.includes('q8h')) {
		frequency = 3;
	} else if (normalizedSig.includes('every 6 hours') || normalizedSig.includes('q6h')) {
		frequency = 4;
	} else if (normalizedSig.includes('every 4 hours') || normalizedSig.includes('q4h')) {
		frequency = 6;
	} else if (normalizedSig.includes('daily') || normalizedSig.includes('once daily') || normalizedSig.includes('once a day') || normalizedSig.includes('qd')) {
		frequency = 1;
	} else if (normalizedSig.includes('every other day') || normalizedSig.includes('qod')) {
		frequency = 0.5;
	}

	return {
		quantity,
		frequency,
		unit
	};
}

