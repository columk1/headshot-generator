import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function rethrowIfRedirectError(error: unknown): void {
	if (isRedirectError(error)) {
		throw error;
	}
}

export async function downloadImage(
	imageUrl: string,
	fileName: string,
): Promise<void> {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			console.error(`HTTP error! status: ${response.status} for ${imageUrl}`);
			return;
		}
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link); // Append to body to ensure click works in all browsers
		link.click();
		document.body.removeChild(link); // Clean up by removing the appended link
		window.URL.revokeObjectURL(url); // Release the object URL to free up memory
	} catch (error) {
		console.error('Download failed:', error);
	}
}
