import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getGenerationById } from '@/lib/db/queries';

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
