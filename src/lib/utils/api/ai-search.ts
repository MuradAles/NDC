import { env } from '$env/dynamic/private';
import type { ApiError } from '$lib/types/api';

export interface AISearchSuggestion {
	suggestedName: string;
	reason: string;
}

/**
 * Use AI to suggest better drug name search terms when FDA search fails
 * This helps when users enter names that don't match FDA database exactly
 */
export async function suggestDrugNameSearchTerms(
	originalName: string
): Promise<AISearchSuggestion[] | ApiError> {
	// Check if OpenAI API key is available
	const apiKey = env.OPENAI_API_KEY;
	if (!apiKey) {
		return {
			error: 'AI_NOT_CONFIGURED',
			message: 'OpenAI API key not configured. AI suggestions unavailable.'
		};
	}

	try {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'system',
						content: `You are a pharmacy assistant helping to find drug names in the FDA NDC database. 
When a drug search fails, suggest 3-5 alternative search terms that are likely to work in the FDA database.
Focus on:
1. Brand names (e.g., "Humalog" instead of "Humalog Insulin")
2. Generic names
3. Common abbreviations
4. Removing descriptive words like "insulin", "tablet", "capsule"
5. Alternative spellings or common variations

Return only valid drug name suggestions, one per line, with a brief reason.`
					},
					{
						role: 'user',
						content: `The drug search for "${originalName}" failed. Suggest 3-5 alternative search terms that might work in the FDA NDC database.`
					}
				],
				max_tokens: 200,
				temperature: 0.3
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				error: 'AI_API_ERROR',
				message: `OpenAI API error: ${response.status} ${errorData.error?.message || 'Unknown error'}`
			};
		}

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content || '';

		// Parse suggestions from AI response
		const suggestions: AISearchSuggestion[] = [];
		const lines = content.split('\n').filter(line => line.trim());

		for (const line of lines) {
			// Try to parse format like "1. Humalog - brand name" or "Humalog (brand name)"
			const match = line.match(/(?:^\d+[\.\)]\s*)?([A-Za-z][A-Za-z0-9\s-]+?)(?:\s*[-–—]\s*|\s*\(|\s*:)(.+?)(?:\)|$)/);
			if (match) {
				suggestions.push({
					suggestedName: match[1].trim(),
					reason: match[2].trim()
				});
			} else {
				// Fallback: just take the first word/phrase
				const cleanLine = line.replace(/^\d+[\.\)]\s*/, '').trim();
				if (cleanLine && cleanLine.length > 2) {
					suggestions.push({
						suggestedName: cleanLine.split(/[-–—\(:]/)[0].trim(),
						reason: 'Alternative search term'
					});
				}
			}

			// Limit to 5 suggestions
			if (suggestions.length >= 5) break;
		}

		return suggestions.length > 0 ? suggestions : [];
	} catch (error) {
		return {
			error: 'NETWORK_ERROR',
			message: error instanceof Error ? error.message : 'Failed to connect to AI service'
		};
	}
}

/**
 * Use AI to clean and normalize a drug name for better search results
 */
export async function normalizeDrugNameWithAI(
	drugName: string
): Promise<string | ApiError> {
	const apiKey = env.OPENAI_API_KEY;
	if (!apiKey) {
		return drugName; // Return original if AI not available
	}

	try {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'system',
						content: `You are a pharmacy assistant. Given a drug name, return ONLY the best search term for the FDA NDC database.
Remove descriptive words like "insulin", "tablet", "capsule", "liquid", "suspension".
Return just the brand name or generic name, nothing else.`
					},
					{
						role: 'user',
						content: `Clean this drug name for FDA database search: "${drugName}"`
					}
				],
				max_tokens: 50,
				temperature: 0.1
			})
		});

		if (!response.ok) {
			return drugName; // Return original on error
		}

		const data = await response.json();
		const cleaned = data.choices?.[0]?.message?.content?.trim() || drugName;
		return cleaned;
	} catch (error) {
		return drugName; // Return original on error
	}
}

