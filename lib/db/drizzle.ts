import { createClient } from '@libsql/client'
import { drizzle as drizzleLibSql } from 'drizzle-orm/libsql'
import * as schema from './schema'

const dbUrl = process.env.DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN is not defined')
}

const client = createClient({
  url: dbUrl,
  authToken: authToken,
})

export const db = drizzleLibSql(client, { schema })
