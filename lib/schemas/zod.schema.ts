// Server-side URL validation
import { z } from 'zod';

export const imageUrlSchema = z
	.string()
	.url()
	.refine((url) => {
		const extension = url.split('.').pop()?.toLowerCase();
		return extension
			? ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(extension)
			: false;
	}, 'Invalid image format. Only jpg, jpeg, png, webp and heic are supported.');

export type ImageData = {
	url: string;
	width: string;
	height: string;
} | null;

const MAX_FILE_SIZE = 10000000; // 10MB
const ACCEPTED_IMAGE_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
];

export const simpleGenerationSchema = z.object({
	inputImageUrl: z.string(),
	gender: z.enum(['male', 'female']),
	background: z.enum(['neutral', 'office', 'city', 'nature']),
});

export type SimpleGenerationData = z.infer<typeof simpleGenerationSchema>;

export const processOrderSchema = simpleGenerationSchema.extend({
	product: z.enum(['headshotBasic']),
});

export type ProcessOrderData = z.infer<typeof processOrderSchema>;

export const orderSchema = z.object({
	userId: z.number().int().positive(),
	generationId: z.number().int().positive(),
	stripePaymentIntentId: z.string().min(1),
	amountPaid: z.number().int().positive(),
});

export type OrderData = z.infer<typeof orderSchema>;

// Client-side file validation
export const imageSchema = z
	.custom<File>()
	.refine(
		(file) => file?.size <= MAX_FILE_SIZE,
		`Max image size is ${MAX_FILE_SIZE / 1000000}MB.`,
	)
	.refine(
		(file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
		'Only .jpg, .jpeg, .png, and .webp formats are supported.',
	);
