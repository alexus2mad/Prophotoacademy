import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { conflict, localDirectory } from './config';
import type { LocalRecord, PageState } from './types';
import type { SitePage } from '../types';

function open() {
  const dir = localDirectory();
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, 'pages.sqlite'));
  db.exec(
    'PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS pages (path TEXT PRIMARY KEY, published TEXT, draft TEXT, revision TEXT NOT NULL)',
  );
  return db;
}

function unpack(row: LocalRecord): PageState {
  return {
    path: row.path,
    revision: row.revision,
    published: row.published ? JSON.parse(row.published) : null,
    draft: row.draft ? JSON.parse(row.draft) : null,
  };
}

export function localStates(pagePath?: string): PageState[] {
  const db = open();
  try {
    const rows = pagePath
      ? db.prepare('SELECT * FROM pages WHERE path=?').all(pagePath)
      : db.prepare('SELECT * FROM pages ORDER BY path').all();
    return (rows as LocalRecord[]).map(unpack);
  } finally {
    db.close();
  }
}

export function localSave(page: SitePage, revision: string | null, publish: boolean): PageState {
  const db = open();
  const next = randomUUID();
  const serialized = JSON.stringify(page);
  try {
    db.exec('BEGIN IMMEDIATE');
    const old = db.prepare('SELECT * FROM pages WHERE path=?').get(page.path) as
      | LocalRecord
      | undefined;
    if ((old?.revision ?? null) !== revision) throw conflict();
    const published = publish ? serialized : (old?.published ?? null);
    const draft = publish ? null : serialized;
    db.prepare(
      'INSERT INTO pages(path,published,draft,revision) VALUES(?,?,?,?) ON CONFLICT(path) DO UPDATE SET published=excluded.published,draft=excluded.draft,revision=excluded.revision',
    ).run(page.path, published, draft, next);
    db.exec('COMMIT');
    return unpack({ path: page.path, published, draft, revision: next });
  } catch (error) {
    if (db.isTransaction) db.exec('ROLLBACK');
    throw error;
  } finally {
    db.close();
  }
}

export function localPublished(path?: string): SitePage[] {
  const db = open();
  try {
    const rows = path
      ? db.prepare('SELECT published FROM pages WHERE path=? AND published IS NOT NULL').all(path)
      : db.prepare('SELECT published FROM pages WHERE published IS NOT NULL ORDER BY path').all();
    return rows.map((row) => JSON.parse(String(row.published)));
  } finally {
    db.close();
  }
}
