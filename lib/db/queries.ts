import { desc, and, eq, isNull, isNotNull, sql } from 'drizzle-orm';
import { db } from './drizzle';
import {
	activityLogs,
	generations,
	orders,
	trainingSessions,
	users,
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import type { z } from 'zod';
import type {
	OrderData,
	orderSchema,
	simpleGenerationSchema,
} from '../schemas/zod.schema';
import { imageConfigDefault } from 'next/dist/shared/lib/image-config';

export async function getUser() {
	const sessionCookie = (await cookies()).get('session');
	if (!sessionCookie || !sessionCookie.value) {
		return null;
	}

	const sessionData = await verifyToken(sessionCookie.value);
	if (
		!sessionData ||
		!sessionData.user ||
		typeof sessionData.user.id !== 'number'
	) {
		return null;
	}

	if (new Date(sessionData.expires) < new Date()) {
		return null;
	}

	const user = await db
		.select()
		.from(users)
		.where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
		.limit(1);

	if (user.length === 0) {
		return null;
	}

	return user[0];
}

export async function getUserByStripeCustomerId(customerId: string) {
	const result = await db
		.select()
		.from(users)
		.where(eq(users.stripeCustomerId, customerId))
		.limit(1);

	return result.length > 0 ? result[0] : null;
}

export async function updateUserStripeCustomerId(
	userId: number,
	stripeCustomerId: string,
) {
	await db
		.update(users)
		.set({ stripeCustomerId, updatedAt: sql`(cast(unixepoch() as int))` })
		.where(eq(users.id, userId));
}

// export async function updateTeamSubscription(
//   teamId: number,
//   subscriptionData: {
//     stripeSubscriptionId: string | null;
//     stripeProductId: string | null;
//     planName: string | null;
//     subscriptionStatus: string;
//   }
// ) {
//   await db
//     .update(teams)
//     .set({
//       ...subscriptionData,
//       updatedAt: new Date(),
//     })
//     .where(eq(teams.id, teamId));
// }

export async function getUserById(userId: number) {
	const result = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.get();

	return result;
}

export async function getActivityLogs() {
	const user = await getUser();
	if (!user) {
		throw new Error('User not authenticated');
	}

	return await db
		.select({
			id: activityLogs.id,
			action: activityLogs.action,
			timestamp: activityLogs.timestamp,
			ipAddress: activityLogs.ipAddress,
			userEmail: users.email,
		})
		.from(activityLogs)
		.leftJoin(users, eq(activityLogs.userId, users.id))
		.where(eq(activityLogs.userId, user.id))
		.orderBy(desc(activityLogs.timestamp))
		.limit(10);
}

export async function getGenerations(options?: { onlyComplete?: boolean }) {
	const { onlyComplete = false } = options || {};
	const user = await getUser();
	if (!user) {
		throw new Error('User not authenticated');
	}

	const conditions = [eq(generations.userId, user.id)];

	if (onlyComplete) {
		conditions.push(eq(generations.status, 'COMPLETED'));
	}

	const results = await db
		.select({
			id: generations.id,
			imageUrl: generations.imageUrl,
			status: generations.status,
			createdAt: generations.createdAt,
			retryCount: generations.retryCount,
		})
		.from(generations)
		.where(and(...conditions))
		.orderBy(desc(generations.createdAt));

	return results;
}

export async function createOrder(data: {
	userId: number;
	generationId: number;
	stripePaymentIntentId: string;
	amountPaid: number;
	status: string; // Added status parameter
}) {
	const { userId, generationId, stripePaymentIntentId, amountPaid, status } =
		data;

	const order = await db
		.insert(orders)
		.values({
			userId,
			generationId,
			stripePaymentIntentId,
			amountPaid,
			status, // Use the provided status
		})
		.returning()
		.get();

	return order;
}

export async function createGeneration(
	options: z.infer<typeof simpleGenerationSchema>,
) {
	const user = await getUser();
	if (!user) {
		throw new Error('User not authenticated');
	}
	const { inputImageUrl, gender, background } = options;

	const generation = await db
		.insert(generations)
		.values({
			userId: user.id,
			gender,
			background,
			inputImageUrl,
		})
		.returning()
		.get();

	return generation;
}

export async function getGenerationById(id: number) {
	return await db
		.select()
		.from(generations)
		.where(eq(generations.id, id))
		.get();
}

/**
 * Valid generation status values
 */
export type GenerationStatus =
	| 'PENDING_PAYMENT'
	| 'PROCESSING'
	| 'COMPLETED'
	| 'FAILED';

/**
 * Updates a generation status
 * @param id - The ID of the generation to update
 * @param status - The new status value
 */
export async function updateGenerationStatus(
	id: number,
	status: GenerationStatus,
) {
	await db
		.update(generations)
		.set({
			status,
		})
		.where(eq(generations.id, id));
}

/**
 * Updates a generation with the output image URL and sets status to COMPLETED
 * @param id - The ID of the generation to update
 * @param imageUrl - The URL of the generated image
 */
export async function updateGenerationOutput(id: number, imageUrl: string) {
	// Update the image URL and status in a single operation
	await db
		.update(generations)
		.set({
			imageUrl,
			status: 'COMPLETED' as GenerationStatus,
		})
		.where(eq(generations.id, id));
}

export async function getOrderByPaymentIntentId(paymentIntentId: string) {
	return await db
		.select()
		.from(orders)
		.where(eq(orders.stripePaymentIntentId, paymentIntentId))
		.get();
}

export async function updateOrderPaymentStatus(params: {
	orderId: number;
	status: string;
	amountPaid: number;
	updatedAt: number;
}) {
	return await db
		.update(orders)
		.set({
			status: params.status,
			amountPaid: params.amountPaid,
			updatedAt: params.updatedAt,
		})
		.where(eq(orders.id, params.orderId))
		.returning()
		.get();
}

/**
 * Get order associated with a generation ID
 */
export async function getOrderByGenerationId(generationId: number) {
	return await db
		.select()
		.from(orders)
		.where(eq(orders.generationId, generationId))
		.get();
}

/**
 * Increment the retry count for a generation
 */
export async function incrementRetryCount(generationId: number) {
	const generation = await getGenerationById(generationId);
	if (!generation) {
		throw new Error('Generation not found');
	}

	await db
		.update(generations)
		.set({
			retryCount: (generation.retryCount || 0) + 1,
		})
		.where(eq(generations.id, generationId));
}
