import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
	getGenerationById,
	updateGenerationStatus,
	getUser,
} from '@/lib/db/queries';

export type GenerationStatusResponse = ReturnType<typeof GET> extends Promise<
	NextResponse<infer T>
>
	? T
	: never;

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const generationIdString = searchParams.get('generationId');

	if (!generationIdString) {
		return NextResponse.json(
			{ error: 'Generation ID is required' },
			{ status: 400 },
		);
	}

	const generationId = Number.parseInt(generationIdString, 10);

	if (Number.isNaN(generationId)) {
		return NextResponse.json(
			{ error: 'Invalid Generation ID format' },
			{ status: 400 },
		);
	}

	try {
		const generation = await getGenerationById(generationId);

		if (!generation) {
			return NextResponse.json(
				{ error: 'Generation not found' },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			id: generation.id,
			status: generation.status,
			imageUrl: generation.imageUrl,
		});
	} catch (error) {
		console.error(
			`Error fetching status for generation ${generationId}:`,
			error,
		);
		return NextResponse.json(
			{ error: 'Failed to fetch generation status' },
			{ status: 500 },
		);
	}
}

/**
 * Mark a generation as failed (e.g., on timeout)
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { generationId, reason } = body;

		if (!generationId || typeof generationId !== 'number') {
			return NextResponse.json(
				{ error: 'Valid generation ID is required' },
				{ status: 400 },
			);
		}

		// Verify user owns this generation
		const user = await getUser();
		if (!user) {
			return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
		}

		const generation = await getGenerationById(generationId);
		if (!generation) {
			return NextResponse.json(
				{ error: 'Generation not found' },
				{ status: 404 },
			);
		}

		if (generation.userId !== user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Only mark as failed if currently processing
		if (generation.status !== 'PROCESSING') {
			return NextResponse.json(
				{ error: 'Generation is not in PROCESSING state' },
				{ status: 400 },
			);
		}

		await updateGenerationStatus(generationId, 'FAILED');

		console.log(
			`Generation ${generationId} marked as FAILED. Reason: ${reason || 'timeout'}`,
		);

		return NextResponse.json({
			success: true,
			message: 'Generation marked as failed',
		});
	} catch (error) {
		console.error('Error marking generation as failed:', error);
		return NextResponse.json(
			{ error: 'Failed to update generation status' },
			{ status: 500 },
		);
	}
}
