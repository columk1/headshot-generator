import type Stripe from 'stripe';
import { processCheckoutSession, stripe } from '@/lib/payments/stripe';
import { after, type NextRequest, NextResponse } from 'next/server';
import {
	createOrder,
	getOrderByPaymentIntentId,
	updateOrderPaymentStatus,
} from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import type { Order } from '@/lib/db/schema';

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

	console.log(
		`[Stripe Webhook] Received event: ${event.type} (ID: ${event.id})`,
	);

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object satisfies Stripe.Checkout.Session;
			// Extract payment intent ID safely
			const paymentIntentId =
				typeof session.payment_intent === 'string'
					? session.payment_intent
					: session.payment_intent?.id;

			const amountPaid = session.amount_total ?? 0;
			const userId = Number(session.client_reference_id);
			const generationId = Number(session.metadata?.generationId);

			console.log('[Stripe Webhook] Checkout session completed:', {
				sessionId: session.id,
				paymentIntentId,
				amount: session.amount_total,
				currency: session.currency,
				customer: session.customer,
				generationId,
				userId,
			});

			if (!userId || !generationId) {
				console.error(
					'[Stripe Webhook] Missing userId or generationId in session data:',
					{ sessionId: session.id, userId, generationId },
				);
				break;
			}

			try {
				let order: Order | undefined;
				if (paymentIntentId) {
					// Paid order: check if it already exists
					order = await getOrderByPaymentIntentId(paymentIntentId);
				}
				if (!order) {
					// Create order for both free and paid
					order = await createOrder({
						userId,
						generationId,
						stripePaymentIntentId: paymentIntentId ?? null,
						amountPaid,
						status: 'paid',
					});
					console.log('[Stripe Webhook] ✓ Order created:', {
						orderId: order.id,
						generationId,
						userId,
						paymentIntentId,
						amountPaid,
					});
				} else if (amountPaid > 0 && order.status !== 'paid') {
					// Update paid order if needed
					await updateOrderPaymentStatus({
						orderId: order.id,
						status: 'paid',
						amountPaid,
						updatedAt: Math.floor(Date.now() / 1000),
					});

					console.log('[Stripe Webhook] ✓ Order updated:', {
						orderId: order.id,
						paymentIntentId,
						previousStatus: order.status,
						newStatus: 'paid',
					});
				} else {
					console.log('[Stripe Webhook] Order already exists:', {
						orderId: order.id,
						paymentIntentId,
					});
				}
			} catch (error) {
				console.error('[Stripe Webhook] Error processing checkout session:', {
					sessionId: session.id,
					paymentIntentId,
					error,
				});
			}
			// generate image after the response has been sent
			after(async () => {
				try {
					console.log(
						'[Stripe Webhook] Starting image generation for session:',
						session.id,
					);
					await processCheckoutSession(stripe, session);
					revalidatePath('/dashboard');
					console.log(
						'[Stripe Webhook] ✓ Image generation completed for session:',
						session.id,
					);
				} catch (error) {
					console.error(
						'[Stripe Webhook] Error in after() during image generation:',
						{ sessionId: session.id, error },
					);
					// Error is logged but generation should already be marked as FAILED
					// by the internal error handling in processCheckoutSession/generateHeadshotById
				}
			});
			break;
		}
		default:
			console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
	}

	return NextResponse.json({ received: true });
}
