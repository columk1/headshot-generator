'use server';

import { generateSimpleHeadshot } from './replicate';
import { z } from 'zod';
import {
	validatedAction,
	validatedActionWithUser,
} from '@/lib/auth/middleware';

// const simpleGenerationSchema = z.object({
// 	image: z.instanceof(File),
// });

const simpleGenerationSchema = z.object({
	image: z.string(),
	gender: z.enum(['male', 'female']),
	background: z.enum(['neutral', 'office', 'city', 'nature']),
});

// const uploadImage = async () =>
// 	'https://t3.ftcdn.net/jpg/02/22/85/16/360_F_222851624_jfoMGbJxwRi5AWGdPgXKSABMnzCQo9RN.jpg';

export const generateHeadshot = validatedAction(
	simpleGenerationSchema,
	async (data, formData) => {
		console.log('data', data);
		console.log('formData', formData);
		const { image, gender, background } = data;
		// const imageUrl = await uploadImage();
		console.log('imageUrl', image);

		const headshot = await generateSimpleHeadshot({
			gender,
			background,
			imageUrl: image,
		});
		console.log('headshot', headshot);
		if (headshot) {
			return {
				success: 'Headshot generated successfully',
				error: '',
				imageUrl: headshot,
			};
		}
		return { error: 'Failed to generate headshot', success: '' };
	},
);
