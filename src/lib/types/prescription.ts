import type { MatchedNDC } from './ndc';

export interface PrescriptionInput {
	drugName?: string;
	ndc?: string;
	sig: string; // e.g., "Take 1 tablet by mouth twice daily"
	daysSupply: number;
}

export interface RelatedDrug {
	name: string;
	rxcui: string;
}

export interface PrescriptionResult {
	rxcui?: string;
	drugName: string;
	totalQuantity: number;
	unit: string;
	matchedNdcs: MatchedNDC[];
	relatedDrugs?: RelatedDrug[];
	warnings: string[];
}

export interface ParsedSig {
	quantity: number;
	frequency: number; // times per day
	unit: string;
}

