import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { getBaseUrl } from '@/lib/url';
import type { User } from '@/lib/db/schema';
import {
	getUserByStripeCustomerId,
	getUser,
	createOrder,
	updateUserStripeCustomerId,
} from '@/lib/db/queries';
import { generateHeadshotById } from '../ai/actions';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
	apiVersion: '2025-08-27.basil',
});

export async function createCheckoutSession({
	priceId,
	generationId,
}: {
	priceId: string;
	generationId: string;
}) {
	const user = await getUser();

	if (!user) {
		redirect(
			`/sign-up?redirect=checkout&priceId=${priceId}&generationId=${generationId}`,
		);
	}

	let stripeCustomerId = user.stripeCustomerId;

	if (!stripeCustomerId) {
		const customer = await stripe.customers.create({
			email: user.email, // Ensure user.email is available and correct
			name: user.email, // Optional: consider adding a name if available
		});
		stripeCustomerId = customer.id;
		await updateUserStripeCustomerId(user.id, stripeCustomerId);
	}

	const baseUrl = await getBaseUrl();

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		mode: 'payment',
		success_url: `${baseUrl}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${baseUrl}/generate?generationId=${generationId}`,
		customer: stripeCustomerId,
		client_reference_id: user.id.toString(),
		allow_promotion_codes: true,
		metadata: {
			generationId,
		},
	});

	if (!session.url) {
		throw new Error('Stripe checkout did not return a URL');
	}

	redirect(session.url);
}

export async function processCheckoutSession(
	stripe: Stripe,
	session: Stripe.Checkout.Session,
) {
	console.log('Processing checkout session');
	const generationId = session.metadata?.generationId;

	if (!generationId) {
		throw new Error('No generation ID found in session metadata.');
	}

	// Retrieve customer details (e.g., email) from Stripe.
	const customer = await stripe.customers.retrieve(session.customer as string);
	console.log('Customer:', customer);

	// const downloadUrl = await trainModelAndGenerateImage({ sessionId: session.id });
	const { success, error, imageUrl } = await generateHeadshotById(
		Number(generationId),
	);

	if (!success) {
		console.error(error);
		return;
	}

	// Send an email with the download link.
	// const email = customer && 'email' in customer ? customer.email : null;
	// if (email) {
	// await sendEmail({
	//   to: email,
	//   subject: 'Your AI-Generated Image is Ready',
	//   text: `Thank you for your payment. Your AI-generated image is now ready. Download it here: ${downloadUrl}`,
	// });
	// }
}

export async function getStripePrices() {
	const prices = await stripe.prices.list({
		expand: ['data.product'],
		active: true,
		type: 'one_time',
	});

	return prices.data.map((price) => ({
		id: price.id,
		productId:
			typeof price.product === 'string' ? price.product : price.product.id,
		unitAmount: price.unit_amount,
		currency: price.currency,
	}));
}

export async function getStripeProducts() {
	const products = await stripe.products.list({
		active: true,
		expand: ['data.default_price'],
	});

	return products.data.map((product) => ({
		id: product.id,
		name: product.name,
		description: product.description,
		defaultPriceId:
			typeof product.default_price === 'string'
				? product.default_price
				: product.default_price?.id,
	}));
}
