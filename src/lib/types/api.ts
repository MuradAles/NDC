export interface RxNormResult {
	rxcui: string;
	normalizedName: string;
}

export interface RxNormError {
	error: string;
	message: string;
}

export interface FDANdcResult {
	results: FDANdcRecord[];
}

export interface FDANdcRecord {
	product_ndc?: string;
	product_name?: string;
	brand_name?: string;
	generic_name?: string;
	dosage_form?: string;
	active_ingredients?: Array<{
		name: string;
		strength: string;
	}>;
	packaging?: Array<{
		package_ndc?: string;
		description?: string;
	}>;
	package_ndc?: string;
	package_description?: string;
	ndc_exclude_flag?: string;
	finished?: boolean;
	listed?: string;
	openfda?: {
		rxcui?: string[];
	};
}

export interface ApiError {
	error: string;
	message: string;
	statusCode?: number;
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

