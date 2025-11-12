import type { NDC } from '$lib/types/ndc';
import type { FDANdcResult, FDANdcRecord, ApiError } from '$lib/types/api';

const FDA_API_BASE = 'https://api.fda.gov/drug/ndc.json';

/**
 * Extract package size from FDA package description
 * Examples: "30 TABLET in 1 BOTTLE", "100 CAPSULE in 1 BOTTLE", "5 mL in 1 VIAL", "87.1 g in 1 PACKAGE"
 */
function extractPackageSize(packageDescription?: string): { size: number; unit: string } {
	if (!packageDescription) {
		return { size: 1, unit: 'unit' };
	}

	// Match patterns like "30 TABLET", "100 CAPSULE", "5 mL", "87.1 g"
	// Pattern: number followed by unit (TABLET, CAPSULE, g, mL, etc.)
	const match = packageDescription.match(/(\d+(?:\.\d+)?)\s+([A-Za-z]+)/i);
	if (match) {
		return {
			size: parseFloat(match[1]),
			unit: match[2].toLowerCase()
		};
	}

	return { size: 1, unit: 'unit' };
}

/**
 * Convert FDA NDC record to our NDC interface
 */
function mapFdaRecordToNdc(record: FDANdcRecord): NDC | null {
	if (!record.product_ndc) {
		return null;
	}

	// Get package description from packaging array or direct field
	let packageDescription: string | undefined;
	if (record.packaging && record.packaging.length > 0) {
		packageDescription = record.packaging[0].description;
	} else {
		packageDescription = record.package_description;
	}

	const { size, unit } = extractPackageSize(packageDescription);
	const isActive = record.ndc_exclude_flag !== 'Y' && record.finished !== false;

	// Get product name from brand_name, generic_name, or product_name
	const productName = record.brand_name || record.generic_name || record.product_name || 'Unknown Product';

	return {
		productNdc: record.product_ndc,
		productName: productName,
		brandName: record.brand_name,
		genericName: record.generic_name,
		dosageForm: record.dosage_form || 'Unknown',
		strength: record.active_ingredients?.[0]?.strength || 'Unknown',
		activeIngredients: record.active_ingredients,
		packageSize: size,
		unit: unit,
		isActive: isActive,
		listedDate: record.listed,
		packageDescription: packageDescription
	};
}

/**
 * Get NDCs by drug name (product name)
 * Note: FDA API doesn't support RxCUI search, so we search by product name
 */
export async function getNdcsByDrugName(drugName: string): Promise<NDC[] | ApiError> {
	try {
		// Clean and prepare search terms
		const cleanedName = drugName.trim();
		const words = cleanedName.split(/\s+/);
		const firstWord = words[0];
		const lastWord = words[words.length - 1];
		
		// Remove common words that might interfere with search
		const commonWords = ['insulin', 'tablet', 'capsule', 'liquid', 'suspension', 'solution', 'injection', 'pen', 'vial'];
		const filteredWords = words.filter(w => !commonWords.includes(w.toLowerCase()));
		const withoutCommonWords = filteredWords.length > 0 ? filteredWords.join(' ') : cleanedName;
		
		// Try multiple search strategies
		// FDA API search format: search=field:"value" or search=field:value
		const searchQueries = [
			// Exact matches
			`brand_name:"${cleanedName}"`,
			`generic_name:"${cleanedName}"`,
			`product_name:"${cleanedName}"`,
			// Without quotes
			`brand_name:${cleanedName}`,
			`generic_name:${cleanedName}`,
			`product_name:${cleanedName}`,
			// First word only
			`brand_name:"${firstWord}"`,
			`generic_name:"${firstWord}"`,
			`product_name:"${firstWord}"`,
			// Without common words
			`brand_name:"${withoutCommonWords}"`,
			`generic_name:"${withoutCommonWords}"`,
			`product_name:"${withoutCommonWords}"`,
			// Last word (sometimes brand names are at the end)
			words.length > 1 ? `brand_name:"${lastWord}"` : null,
			words.length > 1 ? `product_name:"${lastWord}"` : null
		].filter((q): q is string => q !== null);

		for (const searchQuery of searchQueries) {
			// Build URL with proper encoding
			const url = `${FDA_API_BASE}?search=${encodeURIComponent(searchQuery)}&limit=100`;

			try {
				const response = await fetch(url, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (response.ok) {
					const data: FDANdcResult = await response.json();

					if (data.results && data.results.length > 0) {
						const ndcs: NDC[] = [];
						const searchTerms = [
							cleanedName.toLowerCase(),
							firstWord.toLowerCase(),
							withoutCommonWords.toLowerCase()
						].filter(term => term.length > 0);
						
						for (const record of data.results) {
							const ndc = mapFdaRecordToNdc(record);
							if (ndc) {
								// More flexible matching - check if any search term matches
								const recordName = (record.brand_name || record.generic_name || record.product_name || '').toLowerCase();
								const recordWords = recordName.split(/\s+/);
								
								// Match if any search term appears in record name or vice versa
								const matches = searchTerms.some(term => 
									recordName.includes(term) || 
									term.includes(recordName.split(' ')[0]) ||
									recordWords.some(word => word.includes(term) || term.includes(word))
								);
								
								if (matches) {
									ndcs.push(ndc);
								}
							}
						}
						
						if (ndcs.length > 0) {
							return ndcs;
						}
					}
				}
			} catch (fetchError) {
				// Continue to next search query if this one fails
				continue;
			}
		}

		// If all searches fail, return empty array (no matches found)
		return [];
	} catch (error) {
		return {
			error: 'NETWORK_ERROR',
			message: error instanceof Error ? error.message : 'Failed to connect to FDA API'
		};
	}
}

/**
 * Get NDCs by RxCUI code (deprecated - FDA doesn't support this)
 * Kept for backward compatibility, but uses drug name instead
 */
export async function getNdcsByRxcui(rxcui: string): Promise<NDC[] | ApiError> {
	// FDA API doesn't support RxCUI search
	// This function is kept for compatibility but should use drug name instead
	return {
		error: 'NOT_SUPPORTED',
		message: 'FDA API does not support RxCUI search. Use getNdcsByDrugName instead.'
	};
}

/**
 * Get NDC by product NDC code
 * Tries multiple search strategies to find the NDC
 */
export async function getNdcsByNdc(ndc: string): Promise<NDC[] | ApiError> {
	try {
		// Clean NDC format (remove dashes and spaces)
		const cleanNdc = ndc.replace(/[-\s]/g, '');
		// Try to format NDC with dashes (5-4-2, 4-4-2, or 5-4 format)
		let formattedNdc = ndc;
		if (!ndc.includes('-') && cleanNdc.length >= 9) {
			// Try 5-4-2 format (11 digits)
			if (cleanNdc.length === 11) {
				formattedNdc = `${cleanNdc.slice(0, 5)}-${cleanNdc.slice(5, 9)}-${cleanNdc.slice(9)}`;
			}
			// Try 4-4-2 format (10 digits)
			else if (cleanNdc.length === 10) {
				formattedNdc = `${cleanNdc.slice(0, 4)}-${cleanNdc.slice(4, 8)}-${cleanNdc.slice(8)}`;
			}
			// Try 5-4 format (9 digits)
			else if (cleanNdc.length === 9) {
				formattedNdc = `${cleanNdc.slice(0, 5)}-${cleanNdc.slice(5)}`;
			}
		}

		// Try multiple search strategies
		const searchQueries = [
			`product_ndc:"${formattedNdc}"`,
			`product_ndc:${formattedNdc}`,
			`product_ndc:"${cleanNdc}"`,
			`product_ndc:${cleanNdc}`,
			`package_ndc:"${formattedNdc}"`,
			`package_ndc:${formattedNdc}`,
			`package_ndc:"${cleanNdc}"`,
			`package_ndc:${cleanNdc}`
		];

		for (const searchQuery of searchQueries) {
			const url = `${FDA_API_BASE}?search=${encodeURIComponent(searchQuery)}&limit=100`;

			try {
				const response = await fetch(url, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (response.ok) {
					const data: FDANdcResult = await response.json();

					if (data.results && data.results.length > 0) {
						const ndcs: NDC[] = [];
						for (const record of data.results) {
							const mappedNdc = mapFdaRecordToNdc(record);
							if (mappedNdc) {
								ndcs.push(mappedNdc);
							}
						}

						if (ndcs.length > 0) {
							return ndcs;
						}
					}
				}
			} catch (fetchError) {
				// Continue to next search query if this one fails
				continue;
			}
		}

		// If all searches fail, return empty array (no matches found)
		return [];
	} catch (error) {
		return {
			error: 'NETWORK_ERROR',
			message: error instanceof Error ? error.message : 'Failed to connect to FDA API'
		};
	}
}

