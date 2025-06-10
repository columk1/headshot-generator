import type Stripe from 'stripe';
import { processCheckoutSession, stripe } from '@/lib/payments/stripe';
import { after, type NextRequest, NextResponse } from 'next/server';
import {
	createOrder,
	getOrderByPaymentIntentId,
	updateOrderPaymentStatus,
} from '@/lib/db/queries';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(request: NextRequest) {
	const payload = await request.text();
	const signature = request.headers.get('stripe-signature') as string;

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
	} catch (err) {
		console.error('Webhook signature verification failed.', err);
		return NextResponse.json(
			{ error: 'Webhook signature verification failed.' },
			{ status: 400 },
		);
	}

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object satisfies Stripe.Checkout.Session;
			// Extract payment intent ID safely
			const paymentIntentId =
				typeof session.payment_intent === 'string'
					? session.payment_intent
					: session.payment_intent?.id;

			if (!paymentIntentId) {
				console.error('Missing PaymentIntent ID on session.');
				break;
			}
			try {
				// Check if order already exists to handle retries
				// Validate amount_total once upfront
				if (session.amount_total === null) {
					console.error(
						'Webhook Error: session.amount_total is null. Cannot process order for session ID:',
						session.id,
					);
					break;
				}

				let order = await getOrderByPaymentIntentId(paymentIntentId);

				if (!order) {
					// Order doesn't exist, so create it.
					const userId = Number(session.client_reference_id);
					const generationId = Number(session.metadata?.generationId);

					if (!userId || !generationId) {
						console.error(
							'Webhook Error: Missing userId or generationId in session data for session ID:',
							session.id,
						);
						break;
					}

					order = await createOrder({
						userId,
						generationId,
						stripePaymentIntentId: paymentIntentId,
						amountPaid: session.amount_total,
						status: 'paid',
					});
				} else if (order.status !== 'paid') {
					// Order existed but wasn't marked as paid, so update it.
					await updateOrderPaymentStatus({
						orderId: order.id,
						status: 'paid',
						amountPaid: session.amount_total,
						updatedAt: Math.floor(Date.now() / 1000),
					});
				}
			} catch (error) {
				console.error('Error processing checkout session:', error);
			}
			// generate image after the response has been sent
			after(async () => await processCheckoutSession(stripe, session));
			break;
		}
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	return NextResponse.json({ received: true });
}
