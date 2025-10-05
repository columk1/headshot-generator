# Stripe Architecture - Lookup Keys

## Overview

This project uses **Stripe lookup keys** for price management - the recommended approach that eliminates manual ID copying and makes the codebase resilient to Stripe's internal IDs.

## How It Works

### 1. Seeding (One Command Setup)

```bash
pnpm db:seed
```

This creates:
- ✅ Stripe products (with `metadata.sku` for identification)
- ✅ Stripe prices (with `lookup_key` for runtime resolution)
- ✅ Test user, generation, and order in your database
- ✅ **Idempotent**: Safe to run multiple times (checks before creating)

### 2. Runtime Resolution

**In code, we use lookup keys:**

```typescript
// lib/payments/actions.ts
const PRICE_LOOKUP_KEYS = {
  headshotBasic: 'headshot_basic', // Stable identifier
} as const;
```

**At runtime, we resolve to actual price IDs:**

```typescript
const priceId = await resolvePriceLookupKey('headshot_basic');
// Returns: 'price_1RXz5mBFIgkt6SiyXJ9VW9Eu' (or whatever Stripe generated)
```

### 3. Key Files

- **`lib/db/seed.ts`** - Creates products/prices with lookup keys
- **`lib/payments/stripe.ts`** - `resolvePriceLookupKey()` helper
- **`lib/payments/actions.ts`** - Uses lookup keys instead of hardcoded IDs

## Benefits

✅ **No manual steps** - One command sets up everything  
✅ **Idempotent** - Safe to run seed multiple times  
✅ **Environment-agnostic** - Same code works for test/prod Stripe accounts  
✅ **Decoupled** - Your code doesn't depend on Stripe's internal IDs  
✅ **Team-friendly** - No copying IDs between dashboard and code  

## Dev vs Prod

For production:
1. Use separate Stripe API keys (test vs live mode)
2. Run seed script in each environment
3. Same lookup keys work everywhere - no code changes!

```bash
# Dev
STRIPE_SECRET_KEY=sk_test_... pnpm db:seed

# Prod
STRIPE_SECRET_KEY=sk_live_... pnpm db:seed
```

## Adding New Products

```typescript
// In lib/db/seed.ts
await upsertStripePrice({
  lookupKey: 'headshot_premium',      // Your stable identifier
  name: 'Premium AI Headshot',
  description: 'Premium headshot with extras',
  unitAmount: 1999,                   // $19.99
  productMetadata: { sku: 'headshot-premium-v1' },
});

// In lib/payments/actions.ts
const PRICE_LOOKUP_KEYS = {
  headshotBasic: 'headshot_basic',
  headshotPremium: 'headshot_premium', // Add here
} as const;
```

Then just `pnpm db:seed` and you're done!

## References

- [Stripe Lookup Keys Docs](https://stripe.com/docs/api/prices/object#price_object-lookup_key)
- [Idempotent Requests](https://stripe.com/docs/api/idempotent_requests)
- [Stripe Products Best Practices](https://stripe.com/docs/products-prices/pricing-models)
