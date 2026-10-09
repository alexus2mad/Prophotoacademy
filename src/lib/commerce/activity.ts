import { managedDatabase, transaction } from '../database/client';
import { recordActivity } from '../operations';
import type { CustomerActivity } from '../operations/types';
export async function recordCustomerActivity(input: CustomerActivity) {
  if (!managedDatabase()) return recordActivity(input);
  const id = input.source + ':' + input.id;
  return transaction(async (db) => {
    await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['activity:' + id]);
    const old = (await db.query('SELECT data FROM academy.customer_activity WHERE id=$1', [id]))
      .rows[0];
    if (old && Date.parse(old.data.updatedAt) >= Date.parse(input.updatedAt))
      return { changed: false };
    await db.query(
      'INSERT INTO academy.customer_activity(id,data) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET data=excluded.data',
      [id, JSON.stringify(input)],
    );
    return { changed: true };
  });
}
