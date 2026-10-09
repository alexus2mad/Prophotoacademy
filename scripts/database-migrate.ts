import './environment';
import { readdir, readFile } from 'node:fs/promises';
import { databasePool, transaction } from '../src/lib/database/client';
const files = (await readdir('supabase/migrations')).filter((f) => f.endsWith('.sql')).sort();
for (const file of files) {
  await transaction(async (db) => {
    await db.query('SELECT pg_advisory_xact_lock(710090)');
    await db.query(
      'create schema if not exists academy; create table if not exists academy.migrations(version text primary key, applied_at timestamptz not null default now())',
    );
    const version = file.split('_')[0];
    if (
      (await db.query('SELECT version FROM academy.migrations WHERE version=$1', [version]))
        .rowCount
    )
      return;
    await db.query(await readFile('supabase/migrations/' + file, 'utf8'));
    console.log('Applied ' + file);
  });
}
await databasePool().end();
