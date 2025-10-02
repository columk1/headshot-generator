'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
	type User,
	users,
	activityLogs,
	type NewUser,
	type NewActivityLog,
	ActivityType,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { deleteUserFolder } from '@/lib/cloudinary-server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser } from '@/lib/db/queries';
import {
	validatedAction,
	validatedActionWithUser,
} from '@/lib/auth/middleware';

async function logActivity(
	userId: number,
	type: ActivityType,
	ipAddress?: string,
) {
	const newActivity: NewActivityLog = {
		userId,
		action: type,
		ipAddress: ipAddress || '',
	};
	await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
	email: z.string().email().min(3).max(255),
	password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
	const { email, password } = data;

	const foundUser = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.get();

	if (!foundUser) {
		console.log('User not found');
		return {
			error: 'Invalid email or password. Please try again.',
			email,
			password,
		};
	}

	const isPasswordValid = await comparePasswords(
		password,
		foundUser.passwordHash,
	);

	if (!isPasswordValid) {
		console.log('Invalid password');
		return {
			error: 'Invalid email or password. Please try again.',
			email,
			password,
		};
	}

	await Promise.all([
		setSession(foundUser),
		logActivity(foundUser.id, ActivityType.SIGN_IN),
	]);

	const redirectTo = formData.get('redirect') as string | null;
	if (redirectTo === 'checkout') {
		const priceId = formData.get('priceId') as string;
		const generationId = formData.get('generationId') as string;
		return createCheckoutSession({ priceId, generationId });
	}

	redirect('/dashboard');
});

const signUpSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	inviteId: z.string().optional(),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
	const { email, password } = data;

	const existingUser = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	if (existingUser.length > 0) {
		return {
			error: 'Failed to create user. Please try again.',
			email,
			password,
		};
	}

	const passwordHash = await hashPassword(password);

	const newUser: NewUser = {
		email,
		passwordHash,
	};

	const [createdUser] = await db.insert(users).values(newUser).returning();

	if (!createdUser) {
		return {
			error: 'Failed to create user. Please try again.',
			email,
			password,
		};
	}

	await Promise.all([
		logActivity(createdUser.id, ActivityType.SIGN_UP),
		setSession(createdUser),
	]);

	const redirectTo = formData.get('redirect') as string | null;
	if (redirectTo === 'checkout') {
		const priceId = formData.get('priceId') as string;
		const generationId = formData.get('generationId') as string;
		return createCheckoutSession({ priceId, generationId });
	}

	redirect('/dashboard');
});

export async function signOut() {
	const user = (await getUser()) as User;
	await logActivity(user.id, ActivityType.SIGN_OUT);
	(await cookies()).delete('session');
}

const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(8).max(100),
		newPassword: z.string().min(8).max(100),
		confirmPassword: z.string().min(8).max(100),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

export const updatePassword = validatedActionWithUser(
	updatePasswordSchema,
	async (data, _, user) => {
		const { currentPassword, newPassword } = data;

		const isPasswordValid = await comparePasswords(
			currentPassword,
			user.passwordHash,
		);

		if (!isPasswordValid) {
			return { error: 'Current password is incorrect.' };
		}

		if (currentPassword === newPassword) {
			return {
				error: 'New password must be different from the current password.',
			};
		}

		const newPasswordHash = await hashPassword(newPassword);

		await Promise.all([
			db
				.update(users)
				.set({ passwordHash: newPasswordHash })
				.where(eq(users.id, user.id)),
			logActivity(user.id, ActivityType.UPDATE_PASSWORD),
		]);

		return { success: 'Password updated successfully.' };
	},
);

const deleteAccountSchema = z.object({
	password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
	deleteAccountSchema,
	async (data, _, user) => {
		const { password } = data;

		const isPasswordValid = await comparePasswords(password, user.passwordHash);
		if (!isPasswordValid) {
			return { error: 'Incorrect password. Account deletion failed.' };
		}

		await logActivity(user.id, ActivityType.DELETE_ACCOUNT);

		// Best-effort Cloudinary cleanup; do not block deletion on Cloudinary errors
		try {
			await deleteUserFolder(user.id);
		} catch (err) {
			console.error('[deleteAccount] Cloudinary cleanup failed', {
				userId: user.id,
				err,
			});
		}

		// Soft delete
		await db
			.update(users)
			.set({
				deletedAt: sql`CURRENT_TIMESTAMP`,
				email: sql`CONCAT(email, '-', id, '-deleted')`, // Ensure email uniqueness
			})
			.where(eq(users.id, user.id));

		(await cookies()).delete('session');
		redirect('/sign-in');
	},
);

const updateAccountSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100),
	email: z.string().email('Invalid email address'),
});

export const updateAccount = validatedActionWithUser(
	updateAccountSchema,
	async (data, _, user) => {
		const { name, email } = data;

		await Promise.all([
			db.update(users).set({ email }).where(eq(users.id, user.id)),
			logActivity(user.id, ActivityType.UPDATE_ACCOUNT),
		]);

		return { success: 'Account updated successfully.' };
	},
);

const removeTeamMemberSchema = z.object({
	memberId: z.number(),
});
