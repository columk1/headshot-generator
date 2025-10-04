'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Generation type matching the one used in the dashboard component
export type Generation = {
	id: number;
	imageUrl: string | null;
	createdAt: number;
	status: string;
	retryCount?: number; // Track number of retry attempts for security
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
	const latestStatusRef = useRef<string | null>(null);
	const { pollingInterval = 5000 } = options;
	const router = useRouter();

	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;
		let pollCount = 0;
		const MAX_POLLS = 24; // 2 minutes at 5-second intervals

		// Early return if no generation or not in PROCESSING state
		if (!pendingGeneration || pendingGeneration.status !== 'PROCESSING') {
			return () => {};
		}

		// Set initial status message
		setPollingStatus('Uploading...');

		/**
		 * Mark generation as failed due to timeout
		 */
		const markGenerationAsFailed = async (reason: string): Promise<void> => {
			try {
				await fetch('/api/generation-status', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						generationId: pendingGeneration.id,
						reason,
					}),
				});
			} catch (error) {
				console.log(error);
			}
		};

		/**
		 * Poll the generation status API and handle state changes
		 * @returns Whether polling should continue
		 */
		const pollGenerationStatus = async (): Promise<boolean> => {
			try {
				pollCount++;

				// Check if we've exceeded the timeout
				if (pollCount > MAX_POLLS) {
					await markGenerationAsFailed('timeout');
					latestStatusRef.current = 'FAILED';
					setPollingStatus('Generation timed out. Please retry.');
					toast.error(
						'Generation is taking longer than expected. Please try again.',
					);
					return false;
				}

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
				latestStatusRef.current = data.status;
				setPollingStatus(`Generation status: ${data.status}`);

				// Return true only if we should continue polling
				return data.status === 'PROCESSING';
			} catch (error) {
				setPollingStatus('Connection issue.');
				toast.error(
					'Unable to check your generation status. Please refresh the page.',
				);
				return false;
			}
		};

		/**
		 * Handle the end of polling, whether due to completion or error
		 */
		const handlePollingEnd = (): void => {
			const doneMessage =
				latestStatusRef.current === 'FAILED'
					? 'Generation failed.'
					: 'Generation completed.';
			setPollingStatus(doneMessage);

			setTimeout(() => {
				setPollingStatus(null);
				router.refresh();
			}, 2000);

			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}

			// Refresh the page to show updated generations
			// router.refresh();
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
