import { NextResponse, type NextRequest } from 'next/server';
import { getGenerations } from '@/lib/db/queries';
import { cookies, headers } from 'next/headers';

export async function GET(request: NextRequest) {
	try {
		const generationsData = await getGenerations();

		return NextResponse.json(generationsData);
	} catch (error) {
		console.error('Error fetching generations:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error while fetching generations' },
			{ status: 500 },
		);
	}
}
