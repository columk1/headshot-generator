import { db } from './drizzle';
import { users, generations, orders } from './schema';
import { hashPassword } from '@/lib/auth/session';
import Stripe from 'stripe';

// Create standalone Stripe instance for seeding (avoids server-only imports)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
	apiVersion: '2025-08-27.basil',
});

/**
 * Seed script for headshot generator application
 *
 * This seeds:
 * - Stripe products and prices
 * - 1 test user (test@test.com / admin123)
 * - 1 completed generation for that user
 * - 1 order for that generation
 *
 * Architecture:
 * - Products are created with metadata.sku for identification
 * - Prices are created with lookup_key for stable runtime resolution
 * - Runtime code uses resolvePriceLookupKey() to get price IDs dynamically
 * - Idempotent: safe to run multiple times (checks before creating)
 */

/**
 * Get or create a Stripe price using lookup_key
 */
async function upsertStripePrice(params: {
	lookupKey: string;
	name: string;
	description: string;
	unitAmount: number;
	productMetadata?: Record<string, string>;
}) {
	const { lookupKey, name, description, unitAmount, productMetadata } = params;

	// 1) Try to find existing price by lookup_key
	const existingPrices = await stripe.prices.list({
		lookup_keys: [lookupKey],
		limit: 1,
	});

	if (existingPrices.data.length > 0) {
		const price = existingPrices.data[0];
		console.log(`  → Price already exists: ${lookupKey} (${price.id})`);
		return price;
	}

	// 2) Find or create product by metadata.sku
	let product: Stripe.Product | undefined;

	if (productMetadata?.sku) {
		const products = await stripe.products.search({
			query: `metadata['sku']:'${productMetadata.sku}'`,
		});
		if (products.data.length > 0) {
			product = products.data[0];
			console.log(`  → Product found: ${name} (${product.id})`);
		}
	}

	if (!product) {
		product = await stripe.products.create({
			name,
			description,
			metadata: productMetadata,
		});
		console.log(`  ✓ Created product: ${name} (${product.id})`);
	}

	// 3) Create price with lookup_key
	const price = await stripe.prices.create({
		product: product.id,
		unit_amount: unitAmount,
		currency: 'usd',
		lookup_key: lookupKey,
	});

	console.log(
		`  ✓ Created price: ${lookupKey} (${price.id}) - $${(unitAmount / 100).toFixed(2)}`,
	);
	return price;
}

async function seed() {
	console.log('Starting seed process...\n');

	// Step 1: Create Stripe products
	console.log('📦 Setting up Stripe products...');

	await upsertStripePrice({
		lookupKey: 'headshot_basic',
		name: 'Professional AI Headshot',
		description:
			'Studio-quality AI headshot—perfect for LinkedIn, portfolios, and professional profiles.',
		unitAmount: 399, // $3.99
		productMetadata: { sku: 'headshot-basic-v1' },
	});

	console.log('\n✅ Stripe products configured!');
	// Step 2: Create test user
	console.log('👤 Creating test user...');
	const email = 'test@test.com';
	const password = 'admin123';
	const passwordHash = await hashPassword(password);

	const [user] = await db
		.insert(users)
		.values([
			{
				email,
				passwordHash,
			},
		])
		.returning();

	console.log(`  ✓ User created: ${email} / ${password}`);

	// Step 3: Create a completed generation
	console.log('\n🎨 Creating test generation...');
	const [generation] = await db
		.insert(generations)
		.values([
			{
				userId: user.id,
				gender: 'male',
				background: 'office',
				inputImageUrl:
					'https://res.cloudinary.com/demo/image/upload/sample.jpg',
				status: 'COMPLETED',
				imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
				retryCount: 0,
			},
		])
		.returning();

	console.log(`  ✓ Generation created (ID: ${generation.id})`);

	// Step 4: Create an order
	console.log('\n💳 Creating test order...');
	const [order] = await db
		.insert(orders)
		.values([
			{
				userId: user.id,
				generationId: generation.id,
				stripePaymentIntentId: 'pi_test_seed_1234567890',
				amountPaid: 999,
				status: 'completed',
			},
		])
		.returning();

	console.log(
		`  ✓ Order created (ID: ${order.id}, Amount: $${(order.amountPaid / 100).toFixed(2)})`,
	);

	console.log('\n✅ Seed completed successfully!');
	console.log('\n📝 Next steps:');
	console.log(`  • Log in with: ${email} / ${password}`);
}

seed()
	.catch((error) => {
		console.error('❌ Seed process failed:', error);
		process.exit(1);
	})
	.finally(() => {
		console.log('\nExiting...');
		process.exit(0);
	});
