export interface NDC {
	productNdc: string;
	productName: string;
	brandName?: string;
	genericName?: string;
	dosageForm: string;
	strength: string;
	activeIngredients?: Array<{
		name: string;
		strength: string;
	}>;
	packageSize: number;
	unit: string;
	isActive: boolean;
	listedDate?: string;
	packageDescription?: string;
}

export interface MultiPackCombination {
	ndc: NDC;
	packages: number;
}

export interface MatchedNDC extends NDC {
	quantityNeeded: number;
	packagesNeeded: number;
	overfill?: number;
	underfill?: number;
	isOptimal: boolean;
	// Multi-pack combination (if using multiple different package sizes)
	multiPack?: MultiPackCombination[];
}

