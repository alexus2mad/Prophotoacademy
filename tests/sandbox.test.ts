import { afterAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { request } from 'node:http';
import { documentStore, testIdentity, remoteTransactions } from '../scripts/sandbox/store.mjs';
import { startServices } from '../scripts/sandbox/services.mjs';

const directory = await mkdtemp(path.join(tmpdir(), 'prophoto-sandbox-test-'));
const db = new PGlite();
afterAll(async () => {
  await db.close();
  if (!path.basename(directory).startsWith('prophoto-sandbox-test-'))
    throw new Error('Unsafe cleanup');
  await rm(directory, { recursive: true, force: true });
});
describe('local learning sandbox boundaries', () => {
  it('allows only synthetic identities and consumes the requested code once', () => {
    const auth = testIdentity();
    expect(() => auth.send('real@example.com')).toThrow();
    expect(() => auth.verify('student@example.test', '123456')).toThrow();
    auth.send('student@example.test');
    expect(() => auth.verify('student@example.test', '654321')).toThrow();
    const session = auth.verify('student@example.test', '123456');
    expect(auth.user(session.token)?.email).toBe('student@example.test');
    expect(auth.user('unknown')).toBeNull();
    expect(() => auth.verify('student@example.test', '123456')).toThrow();
  });
  it('persists documents and rejects a concurrent stale publication atomically', async () => {
    const file = path.join(directory, 'documents.json'),
      store = await documentStore(file);
    const [draft] = await store.commit({
      patches: [],
      creates: [{ _id: 'draft', title: 'Before' }],
    });
    const command = {
      patches: [{ id: 'draft', revision: draft._rev, value: { title: 'After' } }],
      creates: [{ _id: 'release' }],
    };
    const results = await Promise.allSettled([store.commit(command), store.commit(command)]);
    expect(results.map((r) => r.status).sort()).toEqual(['fulfilled', 'rejected']);
    expect((await documentStore(file)).get('draft').title).toBe('After');
    expect(store.get('release')).toBeTruthy();
  });
  it('matches pg row counts and supports real commit and rollback', async () => {
    await db.exec('CREATE TABLE sample(id integer PRIMARY KEY)');
    const sql = remoteTransactions(db);
    let transaction = await sql.begin();
    await sql.query({ text: 'INSERT INTO sample VALUES(1)', transaction });
    await sql.end(transaction, false);
    expect((await sql.query({ text: 'SELECT * FROM sample' })).rowCount).toBe(0);
    transaction = await sql.begin();
    await sql.query({ text: 'INSERT INTO sample VALUES(1)', transaction });
    await sql.end(transaction, true);
    expect((await sql.query({ text: 'SELECT * FROM sample' })).rowCount).toBe(1);
    expect((await sql.query({ text: 'UPDATE sample SET id=2' })).rowCount).toBe(1);
  });
  it('rejects browser RPC, unauthorized RPC and unissued media links', async () => {
    const server = await startServices({ db, directory, token: 'unit-test-token', port: 3219 });
    try {
      const url = 'http://127.0.0.1:3219';
      expect((await fetch(url + '/rpc', { method: 'POST' })).status).toBe(401);
      expect(
        (
          await fetch(url + '/rpc', {
            method: 'POST',
            headers: { authorization: 'Bearer unit-test-token', origin: 'http://127.0.0.1:3200' },
          })
        ).status,
      ).toBe(401);
      expect((await fetch(url + '/read/unknown')).status).toBe(403);
      const rebound = await new Promise<number | undefined>((resolve, reject) => {
        const req = request(
          url + '/rpc',
          { method: 'POST', headers: { Host: 'evil.example' } },
          (res) => {
            res.resume();
            resolve(res.statusCode);
          },
        );
        req.on('error', reject);
        req.end();
      });
      expect(rebound).toBe(403);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
