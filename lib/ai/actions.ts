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
} from '@/lib/db/queries';
import { simpleGenerationSchema } from '../schemas/zod.schema';

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

export const generateHeadshotById = async (generationId: number) => {
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

	const headshot = await generateSimpleHeadshot(parsedData.data);

	console.log('headshot', headshot);
	if (headshot) {
		await updateGenerationOutput(generationId, headshot);
		return {
			success: 'Headshot generated successfully',
			error: '',
			imageUrl: headshot,
		};
	}
	return { error: 'Failed to generate headshot', success: '' };
};
