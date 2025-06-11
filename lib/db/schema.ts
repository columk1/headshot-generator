import { relations, sql } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

/*
 * Users Table
 */
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	stripeCustomerId: text('stripe_customer_id').unique(),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`(cast(unixepoch() as int))`),
	updatedAt: integer('updated_at'),
	deletedAt: integer('deleted_at'),
});

export const trainingSessions = sqliteTable('training_sessions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`(cast(unixepoch() as int))`),
});

export const referenceImages = sqliteTable('reference_images', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	sessionId: integer('session_id')
		.notNull()
		.references(() => trainingSessions.id),
	url: text('url').notNull(), // Location of the uploaded photo
	createdAt: integer('created_at')
		.notNull()
		.default(sql`(cast(unixepoch() as int))`),
});

export const generations = sqliteTable('generations', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	// sessionId: integer('session_id').references(() => trainingSessions.id),
	gender: text('gender').notNull(),
	background: text('background').notNull(),
	inputImageUrl: text('input_image_url').notNull(),
	status: text('status').notNull().default('PENDING_PAYMENT'),
	imageUrl: text('image_url'), // Where the generated headshot is stored
	createdAt: integer('created_at')
		.notNull()
		.default(sql`(cast(unixepoch() as int))`),
});

export const orders = sqliteTable('orders', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	// sessionId: integer('session_id').references(() => trainingSessions.id),
	generationId: integer('generation_id')
		.notNull()
		.references(() => generations.id),
	stripePaymentIntentId: text('stripe_payment_intent_id').notNull(),
	amountPaid: integer('amount_paid').notNull(), // e.g. in cents
	status: text('status').notNull().default('pending'),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`(cast(unixepoch() as int))`),
	updatedAt: integer('updated_at'),
});

/*
 * Activity Logs Table
 */
export const activityLogs = sqliteTable('activity_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').references(() => users.id),
	action: text('action').notNull(),
	timestamp: integer('timestamp')
		.notNull()
		.default(sql`(cast(unixepoch() as int))`),
	ipAddress: text('ip_address'),
});

/*
 * Relations
 */

export const generationsRelations = relations(generations, ({ one }) => ({
	userId: one(users, {
		fields: [generations.userId],
		references: [users.id],
	}),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
	// trainingSession: one(trainingSessions, {
	// 	fields: [orders.sessionId],
	// 	references: [trainingSessions.id],
	// }),
	generation: one(generations, {
		fields: [orders.generationId],
		references: [generations.id],
	}),
}));

export const referenceImagesRelations = relations(
	referenceImages,
	({ one }) => ({
		trainingSession: one(trainingSessions, {
			fields: [referenceImages.sessionId],
			references: [trainingSessions.id],
		}),
	}),
);

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
	// team: one(teams, {
	// 	fields: [activityLogs.teamId],
	// 	references: [teams.id],
	// }),
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id],
	}),
}));

export const userRelations = relations(users, ({ many }) => ({
	trainingSessions: many(trainingSessions),
}));

export const trainingSessionRelations = relations(
	trainingSessions,
	({ one, many }) => ({
		user: one(users, {
			fields: [trainingSessions.userId],
			references: [users.id],
		}),
		generations: many(generations),
		referenceImages: many(referenceImages),
	}),
);

/*
 * Types
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

// export type TeamDataWithMembers = Team & {
// 	teamMembers: (TeamMember & {
// 		user: Pick<User, 'id' | 'name' | 'email'>;
// 	})[];
// };

export enum ActivityType {
	SIGN_UP = 'SIGN_UP',
	SIGN_IN = 'SIGN_IN',
	SIGN_OUT = 'SIGN_OUT',
	UPDATE_PASSWORD = 'UPDATE_PASSWORD',
	DELETE_ACCOUNT = 'DELETE_ACCOUNT',
	UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
	TRAIN_MODEL = 'TRAIN_MODEL',
	GENERATE_IMAGE = 'GENERATE_IMAGE',
}
