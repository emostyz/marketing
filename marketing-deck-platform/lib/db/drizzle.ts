import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Support both Supabase and direct PostgreSQL connections
const databaseUrl = process.env.DATABASE_URL || 
                   process.env.POSTGRES_URL || 
                   process.env.SUPABASE_DB_URL;

if (!databaseUrl) {
  throw new Error('Database URL not found. Please set DATABASE_URL, POSTGRES_URL, or SUPABASE_DB_URL environment variable');
}

export const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });
