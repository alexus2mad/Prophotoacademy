import { Pool } from 'pg';
import type { DatabaseGlobals, SqlConnection, AuditInput } from './types';

const globals = globalThis as unknown as DatabaseGlobals;
export const managedDatabase = () => Boolean(process.env.DATABASE_URL);
export function databasePool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  globals.academyPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });
  return globals.academyPool;
}
export async function transaction<T>(work: (db: SqlConnection) => Promise<T>) {
  const db = await databasePool().connect();
  try {
    await db.query('BEGIN');
    const result = await work(db);
    await db.query('COMMIT');
    return result;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    db.release();
  }
}
export async function audit(db: SqlConnection, input: AuditInput) {
  await db.query(
    'INSERT INTO academy.audit(actor_id,action,target,reason,before_value,after_value) VALUES($1,$2,$3,$4,$5,$6)',
    [
      input.actorId || null,
      input.action,
      input.target,
      input.reason || '',
      JSON.stringify(input.before ?? null),
      JSON.stringify(input.after ?? null),
    ],
  );
}
export async function consumeRateLimit(key: string, limit: number, seconds: number) {
  const result = await databasePool().query(
    "INSERT INTO academy.rate_limits(key,count,expires) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN academy.rate_limits.expires<now() THEN 1 ELSE academy.rate_limits.count+1 END, expires=CASE WHEN academy.rate_limits.expires<now() THEN excluded.expires ELSE academy.rate_limits.expires END RETURNING count",
    [key, seconds],
  );
  return result.rows[0].count <= limit;
}
