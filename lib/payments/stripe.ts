import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import type { User } from '@/lib/db/schema';
import { getUserByStripeCustomerId, getUser } from '@/lib/db/queries';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
	apiVersion: '2025-02-24.acacia',
});

export async function createCheckoutSession({
	priceId,
}: {
	priceId: string;
}) {
	const user = await getUser();

	if (!user) {
		redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
	}

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		mode: 'payment',
		success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${process.env.BASE_URL}/pricing`,
		customer: user.stripeCustomerId || undefined,
		client_reference_id: user.id.toString(),
		allow_promotion_codes: true,
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
	// Retrieve customer details (e.g., email) from Stripe.
	const customer = await stripe.customers.retrieve(session.customer as string);
	// const user = await getUserByStripeCustomerId(session.customer as string);

	// Trigger the business logic: train model and generate image.
	const downloadUrl = '';
	// const downloadUrl = await trainModelAndGenerateImage({ sessionId: session.id });

	// Send an email with the download link.
	const email = customer && 'email' in customer ? customer.email : null;
	if (email) {
		// await sendEmail({
		//   to: email,
		//   subject: 'Your AI-Generated Image is Ready',
		//   text: `Thank you for your payment. Your AI-generated image is now ready. Download it here: ${downloadUrl}`,
		// });
	}
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
