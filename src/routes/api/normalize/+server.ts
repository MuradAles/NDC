import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { normalizeDrugName } from '$lib/utils/api/rxnorm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { drugName } = await request.json();

		if (!drugName || typeof drugName !== 'string') {
			return json(
				{ error: 'INVALID_INPUT', message: 'Drug name is required' },
				{ status: 400 }
			);
		}

		const result = await normalizeDrugName(drugName);

		if ('error' in result) {
			return json(result, { status: 400 });
		}

		return json(result);
	} catch (error) {
		return json(
			{
				error: 'SERVER_ERROR',
				message: error instanceof Error ? error.message : 'An unexpected error occurred'
			},
			{ status: 500 }
		);
	}
};

