import type { PrescriptionInput } from '$lib/types/prescription';
import type { ValidationResult } from '$lib/types/api';
import { parseSig } from './sig-parser';

/**
 * Validate prescription input
 */
export function validateInput(input: PrescriptionInput): ValidationResult {
	const errors: string[] = [];

	// Check if drug name OR NDC is provided
	if (!input.drugName && !input.ndc) {
		errors.push('Either drug name or NDC must be provided');
	}

	// Validate SIG
	if (!input.sig || input.sig.trim().length === 0) {
		errors.push('SIG (prescription instructions) is required');
	} else {
		const parsed = parseSig(input.sig);
		if (!parsed) {
			errors.push('SIG format is invalid. Please use format like "Take 1 tablet twice daily"');
		}
	}

	// Validate days supply
	if (!input.daysSupply || input.daysSupply <= 0) {
		errors.push('Days supply must be greater than 0');
	}

	if (input.daysSupply && input.daysSupply > 365) {
		errors.push('Days supply cannot exceed 365 days');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Validate SIG format
 */
export function validateSig(sig: string): ValidationResult {
	const errors: string[] = [];

	if (!sig || sig.trim().length === 0) {
		errors.push('SIG is required');
		return {
			isValid: false,
			errors
		};
	}

	const parsed = parseSig(sig);
	if (!parsed) {
		errors.push('SIG format is invalid. Please use format like "Take 1 tablet twice daily"');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

