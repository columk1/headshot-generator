import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, generations, trainingSessions, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

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

export async function getGenerations() {
	const user = await getUser();
	if (!user) {
		throw new Error('User not authenticated');
	}
	return await db
		.select({
			id: generations.id,
			storagePath: generations.storagePath,
			createdAt: generations.createdAt,
		})
		.from(generations)
		.innerJoin(trainingSessions, eq(trainingSessions.id, generations.sessionId))
		.where(eq(trainingSessions.userId, user.id));
}
