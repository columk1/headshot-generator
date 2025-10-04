'use server';

import { generateSimpleHeadshot } from './replicate';
import { z } from 'zod';
import {
	validatedAction,
	validatedActionWithUser,
} from '@/lib/auth/middleware';
import {
	createGeneration as createGenerationInDB,
	getGenerationById,
	getUser,
	updateGenerationOutput,
	updateGenerationStatus,
	getOrderByGenerationId,
	incrementRetryCount,
	type GenerationStatus,
} from '@/lib/db/queries';
import { simpleGenerationSchema } from '../schemas/zod.schema';
import { revalidatePath } from 'next/cache';
import { uploadImageFromUrl } from '@/lib/cloudinary-server';

// const uploadImage = async () =>
// 	'https://t3.ftcdn.net/jpg/02/22/85/16/360_F_222851624_jfoMGbJxwRi5AWGdPgXKSABMnzCQo9RN.jpg';

// export const createGeneration = validatedAction(
// 	simpleGenerationSchema,
// 	async (data, formData) => {
// 		console.log('data', data);
// 		console.log('formData', formData);
// 		const { inputImageUrl, gender, background } = data;
// 		console.log('imageUrl', inputImageUrl);

// 		const generation = await createGenerationInDB({
// 			gender,
// 			background,
// 			inputImageUrl,
// 		});

// 		return {
// 			generationId: generation.id,
// 			error: '',
// 			success: 'Generation created successfully',
// 		};
// 	},
// );

export const revalidate = async () => revalidatePath('/dashboard');

// Schema for retrying a generation
const retryGenerationSchema = z.object({
	generationId: z.number().int().positive(),
});

// Maximum number of retries allowed per generation
const MAX_RETRIES = 3;

/**
 * Server action to retry a failed generation.
 * SECURITY: Implements multiple checks to prevent abuse and unauthorized retries.
 */
export async function retryGeneration(formData: FormData) {
	const rawId = formData.get('generationId');
	const parsedId = Number(rawId);

	const parsed = retryGenerationSchema.safeParse({ generationId: parsedId });
	if (!parsed.success) {
		return { error: 'Invalid generation ID', success: '' } as const;
	}

	const user = await getUser();
	if (!user) {
		return { error: 'Not authenticated', success: '' } as const;
	}

	const generation = await getGenerationById(parsed.data.generationId);
	if (!generation) {
		return { error: 'Generation not found', success: '' } as const;
	}

	// SECURITY: Verify ownership
	if (generation.userId !== user.id) {
		return {
			error: 'You do not have access to this generation',
			success: '',
		} as const;
	}

	// SECURITY: Only allow retrying FAILED generations
	if (generation.status !== 'FAILED') {
		return {
			error: 'Only failed generations can be retried',
			success: '',
		} as const;
	}

	// SECURITY: Check retry limit to prevent infinite retries
	const retryCount = generation.retryCount || 0;
	if (retryCount >= MAX_RETRIES) {
		return {
			error: `Maximum retry limit (${MAX_RETRIES}) reached. Please contact support.`,
			success: '',
		} as const;
	}

	// SECURITY: Verify there's a paid order for this generation
	const order = await getOrderByGenerationId(parsed.data.generationId);
	if (!order) {
		return {
			error: 'No payment found for this generation',
			success: '',
		} as const;
	}

	if (order.status !== 'succeeded') {
		return {
			error: 'Payment has not been completed for this generation',
			success: '',
		} as const;
	}

	// All security checks passed - proceed with retry
	await incrementRetryCount(parsed.data.generationId);
	await updateGenerationStatus(parsed.data.generationId, 'PROCESSING');
	void generateHeadshotById(parsed.data.generationId);
	revalidatePath('/dashboard');
	return { error: '', success: 'Retry started' } as const;
}

export async function generateHeadshotById(generationId: number) {
	const generation = await getGenerationById(generationId);
	if (!generation) {
		console.error(`Generation ${generationId} not found`);
		return { error: 'Generation not found', success: '' };
	}

	// Validate the data from the DB against the Zod schema
	const parsedData = simpleGenerationSchema.safeParse({
		inputImageUrl: generation.inputImageUrl,
		gender: generation.gender,
		background: generation.background,
	});

	if (!parsedData.success) {
		console.error(
			`Invalid generation data for ${generationId}:`,
			parsedData.error,
		);
		await updateGenerationStatus(generationId, 'FAILED');
		return { error: 'Invalid generation data in database.', success: '' };
	}

	try {
		const headshotUrl = await generateSimpleHeadshot(parsedData.data);

		console.log('[generateHeadshotById] replicateUrl:', headshotUrl);
		if (headshotUrl) {
			// Upload to Cloudinary first and persist the Cloudinary URL only
			const folder = `headshot/users/${generation.userId}/output`;
			const { secureUrl } = await uploadImageFromUrl({
				fileUrl: headshotUrl,
				folder,
				publicId: `gen-${generationId}`,
			});
			console.log('[generateHeadshotById] cloudinary.secureUrl:', secureUrl);
			await updateGenerationOutput(generationId, secureUrl);
			console.log(
				'[generateHeadshotById] DB updated with Cloudinary URL for generationId:',
				generationId,
			);
			return {
				success: 'Headshot generated successfully',
				error: '',
				imageUrl: secureUrl,
			};
		}
		// If we get here, generation failed but didn't throw an error
		console.error(`Generation ${generationId} returned no URL`);
		await updateGenerationStatus(generationId, 'FAILED');
		return { error: 'Failed to generate headshot', success: '' };
	} catch (error) {
		// If an error occurs during generation, update status to FAILED
		console.error(`Error generating headshot ${generationId}:`, error);
		await updateGenerationStatus(generationId, 'FAILED');
		return { error: 'Error during headshot generation', success: '' };
	}
}
