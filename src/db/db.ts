import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Koneksi ke PostgreSQL menggunakan URL dari environment variable
const queryClient = postgres(process.env.DATABASE_URL as string);

// Inisialisasi Drizzle ORM dengan skema yang telah dibuat
export const db = drizzle(queryClient, { schema });
