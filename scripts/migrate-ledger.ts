import './environment';
import { DatabaseSync } from 'node:sqlite';
import { databasePool, transaction } from '../src/lib/database/client';
import type { LegacyRow } from './types';
const file = process.argv.find((x) => x.startsWith('--file='))?.slice(7);
if (!file) throw new Error('Use --file=<private SQLite path>; add --write after reviewing counts');
const source = new DatabaseSync(file, { readOnly: true });
const tables = ['orders', 'inquiries', 'outbox', 'customer_activity'];
const snapshot = new Map<string, LegacyRow[]>();
for (const table of tables) {
  const exists = source
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(table);
  snapshot.set(
    table,
    exists ? (source.prepare('SELECT * FROM ' + table).all() as LegacyRow[]) : [],
  );
}
console.log(
  'Source counts',
  Object.fromEntries([...snapshot].map(([table, rows]) => [table, rows.length])),
);
if (process.argv.includes('--write')) {
  await transaction(async (db) => {
    for (const row of snapshot.get('orders')!)
      await db.query(
        'INSERT INTO academy.orders(id,token_hash,idempotency_key,fingerprint,data,created_at) VALUES($1,$2,$3,$4,$5,to_timestamp($6)) ON CONFLICT(id) DO NOTHING',
        [
          row.id,
          row.token_hash,
          row.idempotency_key,
          row.fingerprint,
          row.data,
          JSON.parse(String(row.data)).createdAt,
        ],
      );
    for (const row of snapshot.get('inquiries')!)
      await db.query(
        'INSERT INTO academy.inquiries(id,data,created_at) VALUES($1,$2,to_timestamp($3/1000.0)) ON CONFLICT(id) DO NOTHING',
        [row.id, row.data, row.created_at],
      );
    for (const row of snapshot.get('customer_activity')!)
      await db.query(
        'INSERT INTO academy.customer_activity(id,data) VALUES($1,$2) ON CONFLICT(id) DO NOTHING',
        [row.id, row.data],
      );
    for (const row of snapshot.get('outbox')!)
      await db.query(
        'INSERT INTO academy.outbox(id,kind,data,attempts,next_attempt,state,last_error) VALUES($1,$2,$3,$4,to_timestamp($5/1000.0),$6,$7) ON CONFLICT(id) DO NOTHING',
        [row.id, row.kind, row.data, row.attempts, row.next_attempt, row.state, row.last_error],
      );
    for (const [table, rows] of snapshot) {
      const ids = rows.map((r) => r.id);
      const count = (
        await db.query(
          'SELECT count(*)::int AS count FROM academy.' + table + ' WHERE id=ANY($1::text[])',
          [ids],
        )
      ).rows[0].count;
      if (count !== rows.length) throw new Error('Reconciliation failed for ' + table);
      console.log('Reconciled ' + table + ': ' + count);
    }
  });
  console.log(
    'Legacy purchases preserved. Map historical purchases to a reviewed curriculum before granting access. No emails sent.',
  );
  await databasePool().end();
} else
  console.log(
    'Dry run; no destination changes. Back up the source and configure DATABASE_URL before --write.',
  );
source.close();
