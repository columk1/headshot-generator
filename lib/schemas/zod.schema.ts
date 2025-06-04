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
