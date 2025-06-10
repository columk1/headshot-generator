import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { type NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { generateHeadshotById } from '@/lib/ai/actions';

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const sessionId = searchParams.get('session_id');

	if (!sessionId) {
		return NextResponse.redirect(new URL('/pricing', request.url));
	}

	try {
		const session = await stripe.checkout.sessions.retrieve(sessionId, {
			expand: ['customer'],
		});

		if (!session.customer || typeof session.customer === 'string') {
			throw new Error('Invalid customer data from Stripe.');
		}

		if (session.payment_status !== 'paid') {
			throw new Error('Payment not successful for this session.');
		}

		const customerId = session.customer.id;
		const userId = session.client_reference_id;

		if (!userId) {
			throw new Error("No user ID found in the session's client_reference_id.");
		}

		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, Number(userId)))
			.limit(1);

		if (user.length === 0) {
			throw new Error('User not found in database.');
		}

		await db
			.update(users)
			.set({
				stripeCustomerId: customerId,
				updatedAt: Math.floor(Date.now() / 1000),
			})
			.where(eq(users.id, Number(userId)));

		await setSession(user[0]);

		return NextResponse.redirect(new URL('/dashboard', request.url));
	} catch (error) {
		console.error('Error handling successful checkout:', error);
		return NextResponse.redirect(new URL('/error', request.url));
	}
}
