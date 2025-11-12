import type { RxNormResult, RxNormError } from '$lib/types/api';

const RXNORM_API_BASE = 'https://rxnav.nlm.nih.gov/REST';

export interface RelatedDrug {
	name: string;
	rxcui: string;
}

export async function normalizeDrugName(
	drugName: string
): Promise<RxNormResult | RxNormError> {
	try {
		// RxNorm API is public - no API key required
		const url = `${RXNORM_API_BASE}/rxcui.json?name=${encodeURIComponent(drugName)}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			return {
				error: 'API_ERROR',
				message: `RxNorm API returned status ${response.status}`
			};
		}

		const data = await response.json();

		// RxNorm API response structure
		if (data.idGroup?.rxnormId && data.idGroup.rxnormId.length > 0) {
			const rxcui = data.idGroup.rxnormId[0];
			
			// Get normalized name
			const nameResponse = await fetch(
				`${RXNORM_API_BASE}/rxcui/${rxcui}/properties.json`
			);
			
			let normalizedName = drugName;
			if (nameResponse.ok) {
				const nameData = await nameResponse.json();
				normalizedName = nameData.properties?.name || drugName;
			}

			return {
				rxcui,
				normalizedName
			};
		}

		return {
			error: 'DRUG_NOT_FOUND',
			message: `No RxCUI found for drug name: ${drugName}`
		};
	} catch (error) {
		return {
			error: 'NETWORK_ERROR',
			message: error instanceof Error ? error.message : 'Failed to connect to RxNorm API'
		};
	}
}

/**
 * Get related drugs for a given RxCUI
 * Returns related drugs including ingredients, brand names, and therapeutic alternatives
 */
export async function getRelatedDrugs(rxcui: string): Promise<RelatedDrug[] | RxNormError> {
	try {
		// Get all related drugs (ingredients, brand names, etc.)
		const url = `${RXNORM_API_BASE}/rxcui/${rxcui}/related.json?tty=IN+BN+SCD+SBD`;
		
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			return {
				error: 'API_ERROR',
				message: `RxNorm API returned status ${response.status}`
			};
		}

		const data = await response.json();
		const relatedDrugs: RelatedDrug[] = [];

		// Parse related drugs from response
		if (data.relatedGroup?.conceptGroup) {
			for (const group of data.relatedGroup.conceptGroup) {
				if (group.conceptProperties) {
					for (const concept of group.conceptProperties) {
						if (concept.name && concept.rxcui) {
							// Avoid duplicates
							if (!relatedDrugs.find(d => d.rxcui === concept.rxcui)) {
								relatedDrugs.push({
									name: concept.name,
									rxcui: concept.rxcui
								});
							}
						}
					}
				}
			}
		}

		// Limit to 10+ related drugs
		return relatedDrugs.slice(0, 15);
	} catch (error) {
		return {
			error: 'NETWORK_ERROR',
			message: error instanceof Error ? error.message : 'Failed to connect to RxNorm API'
		};
	}
}

