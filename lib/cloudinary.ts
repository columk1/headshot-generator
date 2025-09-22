// This module generates a signature for the image upload in the create post/reply form so the client can upload to Cloudinary
'use server';

import 'server-only';

import crypto from 'node:crypto';

import { redirect } from 'next/navigation';

import { ROUTES } from '@/lib/constants';
import { getUser } from './db/queries';

type uploadOptions = {
	[key: string]: string | undefined;
};

export const signUploadForm = async (options: uploadOptions) => {
	const user = await getUser();

	if (!user) {
		redirect(ROUTES.LOGIN);
	}

	if (
		!process.env.CLOUDINARY_API_SECRET ||
		!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
		!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
	) {
		throw new Error('Cloudinary environment variables not defined');
	}

	const timestamp = Math.round(new Date().getTime() / 1000).toString();

	// Enforce per-user foldering on the server (ignore client-provided folder)
	const enforcedFolder = `headshot/users/${user.id}/input`;

	const { folder: _ignoredFolder, ...restOptions } = options;

	const params: Record<string, string> = {
		timestamp,
		folder: enforcedFolder,
		...restOptions,
	};

	const apiSecret = process.env.CLOUDINARY_API_SECRET;

	const sortedParams = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join('&');

	const stringToSign = `${sortedParams}${apiSecret}`;

	const signature = crypto
		.createHash('sha1')
		.update(stringToSign)
		.digest('hex');

	return {
		timestamp: String(timestamp),
		signature,
		apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
		folder: enforcedFolder,
	};
};
