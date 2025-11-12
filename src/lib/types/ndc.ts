export interface NDC {
	productNdc: string;
	productName: string;
	dosageForm: string;
	strength: string;
	packageSize: number;
	unit: string;
	isActive: boolean;
}

export interface MatchedNDC extends NDC {
	quantityNeeded: number;
	packagesNeeded: number;
	overfill?: number;
	underfill?: number;
	isOptimal: boolean;
}

