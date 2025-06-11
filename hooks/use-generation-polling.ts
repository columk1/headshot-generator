'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Generation type matching the one used in the dashboard component
export type Generation = {
	id: number;
	imageUrl: string | null;
	createdAt: number;
	status: string;
};

export type GenerationStatusResponse = {
	id: number;
	status: string;
	imageUrl?: string;
	error?: string;
};

type UseGenerationPollingOptions = {
	pollingInterval?: number;
};

type UseGenerationPollingResult = {
	pollingStatus: string | null;
};

/**
 * Custom hook for polling generation status
 * @param pendingGeneration - The pending generation to poll for
 * @param options - Optional configuration options
 * @returns Polling status information
 */
export function useGenerationPolling(
	pendingGeneration: Generation | null,
	options: UseGenerationPollingOptions = {},
): UseGenerationPollingResult {
	const [pollingStatus, setPollingStatus] = useState<string | null>(null);
	const router = useRouter();
	const { pollingInterval = 5000 } = options;

	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;

		// Early return if no generation or not in PROCESSING state
		if (!pendingGeneration || pendingGeneration.status !== 'PROCESSING') {
			return () => {};
		}

		// Set initial status message
		setPollingStatus(`Polling generation #${pendingGeneration.id}...`);

		/**
		 * Poll the generation status API and handle state changes
		 * @returns Whether polling should continue
		 */
		const pollGenerationStatus = async (): Promise<boolean> => {
			try {
				// Fetch the latest status from the API
				const response = await fetch(
					`/api/generation-status?generationId=${pendingGeneration.id}`,
				);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch generation status: ${response.status}`,
					);
				}

				const data: GenerationStatusResponse = await response.json();

				if ('error' in data) {
					throw new Error(data.error);
				}

				// Update UI with current status
				setPollingStatus(`Generation #${data.id} status: ${data.status}`);

				// Return true only if we should continue polling
				return data.status === 'PROCESSING';
			} catch (error) {
				console.error('Error polling generation status:', error);
				setPollingStatus('Error polling status. Stopping poll.');
				return false;
			}
		};

		/**
		 * Handle the end of polling, whether due to completion or error
		 */
		const handlePollingEnd = (): void => {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}

			// Refresh the page to show updated generations
			router.refresh();
		};

		// Start polling process
		const startPolling = async (): Promise<void> => {
			// Initial poll
			const shouldContinue = await pollGenerationStatus();

			if (shouldContinue) {
				// Set up interval for continuous polling
				intervalId = setInterval(async () => {
					const shouldContinuePolling = await pollGenerationStatus();

					if (!shouldContinuePolling) {
						handlePollingEnd();
					}
				}, pollingInterval);
			} else {
				// Initial poll already shows completion or error
				handlePollingEnd();
			}
		};

		// Start the polling process
		void startPolling();

		// Cleanup function to clear interval when component unmounts
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [pendingGeneration, pollingInterval, router]);

	return { pollingStatus };
}
