'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, resolvePriceLookupKey } from './stripe';
import { createGeneration } from '@/lib/db/queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { processOrderSchema } from '@/lib/schemas/zod.schema';
import { rethrowIfRedirectError } from '@/lib/utils';

/**
 * Lookup keys for Stripe prices
 * These are stable identifiers - no hardcoded price IDs needed!
 */
const PRICE_LOOKUP_KEYS = {
	headshotBasic: 'headshot_basic',
} as const;

export const checkoutAction = async (formData: FormData) => {
	const priceId = formData.get('priceId') as string;
	const generationId = formData.get('generationId') as string;
	await createCheckoutSession({ priceId, generationId });
};

export const processGenerationOrder = validatedActionWithUser(
	processOrderSchema,
	async (data, user) => {
		const { inputImageUrl, gender, background, product } = data;
		const lookupKey = PRICE_LOOKUP_KEYS[product];

		let generationId: number;

		try {
			const generationRecord = await createGeneration({
				inputImageUrl,
				gender,
				background,
			});

			if (!generationRecord || typeof generationRecord.id !== 'number') {
				throw new Error(
					'Failed to create generation record or retrieve its ID.',
				);
			}
			generationId = generationRecord.id;
			console.log(
				`Generation record ${generationId} created with PENDING_PAYMENT status.`,
			);
		} catch (err) {
			console.error('Database error creating generation record:', err);
			return {
				error: 'Failed to save generation details. Please try again.',
				success: '',
			};
		}

		try {
			// Resolve the lookup key to an actual Stripe price ID
			const priceId = await resolvePriceLookupKey(lookupKey);
			
			await createCheckoutSession({
				priceId,
				generationId: generationId.toString(),
			});
			return {
				success: 'Payment processing initiated, redirecting to Stripe...', // User might not see this
				error: '',
			};
		} catch (error: unknown) {
			rethrowIfRedirectError(error);

			console.error('Error processing generation order:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'An unknown error occurred.';
			return {
				success: '',
				error: `Failed to process order: ${errorMessage}`,
			};
		}
	},
);
