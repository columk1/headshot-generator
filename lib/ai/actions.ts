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
	updateGenerationOutput,
	updateGenerationStatus,
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

export async function generateHeadshotById(generationId: number) {
	const generation = await getGenerationById(generationId);
	if (!generation) {
		return { error: 'Generation not found', success: '' };
	}

	// Validate the data from the DB against the Zod schema
	const parsedData = simpleGenerationSchema.safeParse({
		inputImageUrl: generation.inputImageUrl,
		gender: generation.gender,
		background: generation.background,
	});

	if (!parsedData.success) {
		console.error(parsedData.error);
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
		await updateGenerationStatus(generationId, 'FAILED');
		return { error: 'Failed to generate headshot', success: '' };
	} catch (error) {
		// If an error occurs during generation, update status to FAILED
		console.error('Error generating headshot:', error);
		await updateGenerationStatus(generationId, 'FAILED');
		return { error: 'Error during headshot generation', success: '' };
	}
}
