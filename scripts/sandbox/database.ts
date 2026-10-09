import { rpc } from './rpc';
import type { SqlConnection, AuditInput } from '@/lib/database/types';
import type { SandboxQuery } from './types';
export const managedDatabase = () => true;
const query: SandboxQuery = (text, values) => rpc('db.query', { text, values });
export const databasePool = (): SqlConnection => ({ query });
export async function transaction<T>(work: (db: SqlConnection) => Promise<T>) {
  const id = await rpc<string>('db.begin');
  const txQuery: SandboxQuery = (text, values) =>
    rpc('db.query', { text, values, transaction: id });
  try {
    const result = await work({ query: txQuery });
    await rpc('db.commit', { id });
    return result;
  } catch (error) {
    await rpc('db.rollback', { id }).catch(() => {});
    throw error;
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
  const result = await query(
    "INSERT INTO academy.rate_limits(key,count,expires) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN academy.rate_limits.expires<now() THEN 1 ELSE academy.rate_limits.count+1 END, expires=CASE WHEN academy.rate_limits.expires<now() THEN excluded.expires ELSE academy.rate_limits.expires END RETURNING count",
    [key, seconds],
  );
  return result.rows[0].count <= limit;
}
