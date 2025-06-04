import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config({ path: '.env.local' });
if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not defined');
}
if (!process.env.TURSO_AUTH_TOKEN) {
	throw new Error('TURSO_AUTH_TOKEN is not defined');
}

export default {
	schema: './lib/db/schema.ts',
	out: './lib/db/migrations',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.DATABASE_URL,
		authToken: process.env.TURSO_AUTH_TOKEN,
	},
	verbose: true,
	strict: true,
} satisfies Config;
