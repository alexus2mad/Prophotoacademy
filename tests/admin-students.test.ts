import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import seed from '../content/academy.json';
import { POST as adminAction } from '../src/app/api/admin/[action]/route';
import { GET as roster } from '../src/app/api/admin/roster/route';
import { HttpError } from '../src/lib/http';
import type { SqlConnection } from '../src/lib/database/types';
import type { AdminAuthState, GrantRevocationRow } from './types';

const pg = new PGlite();
const sql: SqlConnection = {
  query: async (text, values) => {
    const result = await pg.query(text, values);
    return { ...result, rowCount: result.affectedRows || result.rows.length } as never;
  },
};
const origin = 'https://academy.example';
const admin = randomUUID(),
  student = randomUUID(),
  session = randomUUID();
const auth: AdminAuthState = { role: 'admin', fresh: false };
vi.mock('@/lib/content', () => ({ getContent: async () => seed }));
vi.mock('@/lib/auth/server', () => ({
  requireAdmin: async (fresh = false) => {
    if (auth.role !== 'admin') throw new HttpError(403, 'Потрібні права адміністратора');
    if (fresh && !auth.fresh) throw new HttpError(428, 'Підтвердьте email ще раз для цієї дії');
    return { id: admin, email: 'admin@example.test', name: 'Admin', role: 'admin' };
  },
}));
vi.mock('../src/lib/database/client', async (load) => ({
  ...(await load<typeof import('../src/lib/database/client')>()),
  consumeRateLimit: async () => true,
  managedDatabase: () => true,
  databasePool: () => sql,
  transaction: async (work: (db: SqlConnection) => Promise<unknown>) =>
    pg.transaction(async (tx) =>
      work({
        query: async (text, values) => {
          const r = await tx.query(text, values);
          return { ...r, rowCount: r.affectedRows || r.rows.length } as never;
        },
      }),
    ),
}));
const post = (action: string, body: unknown) =>
  adminAction(
    new Request(`${origin}/api/admin/${action}`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ action }) },
  );
const grant = (extra: Record<string, unknown> = {}) => ({
  action: 'grant',
  grantId: randomUUID(),
  email: 'student@example.test',
  courseId: 'course',
  releaseId: 'release',
  lessonIds: ['lesson'],
  packageName: 'Адміністративний доступ',
  expiresAt: null,
  reason: 'Оплата на рахунок',
  ...extra,
});
beforeAll(async () => {
  for (const file of ['202610090001_learning.sql', '202610090003_booking_management.sql'])
    await pg.exec(await readFile('supabase/migrations/' + file, 'utf8'));
});
beforeEach(async () => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', origin);
  vi.stubEnv('TRUST_PROXY', '0');
  auth.role = 'admin';
  auth.fresh = false;
  await pg.exec(
    'TRUNCATE academy.attendance,academy.live_sessions,academy.grants,academy.releases,academy.courses,academy.admin_invitations,academy.audit,academy.profiles CASCADE',
  );
  await pg.query(
    `INSERT INTO academy.profiles(id,email,name,role,verified_at) VALUES
      ($1,'admin@example.test','Admin','admin',now()),($2,'student@example.test','Student','student',now())`,
    [admin, student],
  );
  await pg.exec(`INSERT INTO academy.courses(id,program_id,title,active_release_id) VALUES('course','program-visual','Курс','release');
    INSERT INTO academy.releases(id,course_id,version,manifest) VALUES('release','course',1,'{"title":"Курс","modules":[{"lessons":[{"id":"lesson","title":"Урок"}]}]}');`);
  await pg.query(
    `INSERT INTO academy.live_sessions(id,course_id,lesson_id,title,zoom_url,starts_at,ends_at,timezone,status)
     VALUES($1,'course','lesson','Зустріч','https://zoom.example/j/1',now()-interval '2 hours',now()-interval '1 hour','Europe/Kyiv','scheduled')`,
    [session],
  );
});
afterAll(async () => {
  await pg.close();
  vi.unstubAllEnvs();
});

describe('student management in the Academy admin', () => {
  it('grants and revokes course access with an audited reason', async () => {
    const input = grant();
    expect((await post('access', input)).status).toBe(200);
    const rows = (await pg.query('SELECT id,user_id,revoked_at FROM academy.grants')).rows;
    expect(rows).toMatchObject([{ id: input.grantId, user_id: student, revoked_at: null }]);
    const revoke = await post('access', {
      ...input,
      action: 'revoke',
      reason: 'Повернення коштів',
    });
    expect(revoke.status).toBe(200);
    expect(
      (await pg.query<GrantRevocationRow>('SELECT revoked_at FROM academy.grants')).rows[0]
        .revoked_at,
    ).not.toBeNull();
    expect((await post('access', grant({ reason: '' }))).status).toBe(400);
  });
  it('requires a fresh email check for administrator changes and keeps the last admin', async () => {
    const change = { email: 'student@example.test', grant: true, reason: 'Новий викладач' };
    expect((await post('team', change)).status).toBe(428);
    auth.fresh = true;
    expect((await post('team', change)).status).toBe(200);
    expect(
      (await pg.query("SELECT role FROM academy.profiles WHERE email='student@example.test'"))
        .rows[0],
    ).toEqual({ role: 'admin' });
    expect(
      (await post('team', { email: 'new@example.test', grant: true, reason: 'Запрошення' })).status,
    ).toBe(200);
    expect((await pg.query('SELECT email FROM academy.admin_invitations')).rows).toEqual([
      { email: 'new@example.test' },
    ]);
    await pg.exec("UPDATE academy.profiles SET role='student' WHERE email='student@example.test'");
    const last = await post('team', {
      email: 'admin@example.test',
      grant: false,
      reason: 'Помилка',
    });
    expect(last.status).toBe(409);
  });
  it('lists a meeting roster and records attendance after the meeting', async () => {
    await post('access', grant());
    const before = await roster(new Request(`${origin}/api/admin/roster?sessionId=${session}`));
    expect(await before.json()).toEqual({
      people: [{ id: student, email: 'student@example.test', name: 'Student', attended: false }],
    });
    const saved = await post('attendance', {
      sessionId: session,
      userIds: [student],
      attended: true,
    });
    expect(saved.status).toBe(200);
    const after = await roster(new Request(`${origin}/api/admin/roster?sessionId=${session}`));
    expect((await after.json()).people[0].attended).toBe(true);
  });
  it('refuses everything to non-administrators', async () => {
    auth.role = 'student';
    expect((await post('access', grant())).status).toBe(403);
    expect(
      (await roster(new Request(`${origin}/api/admin/roster?sessionId=${session}`))).status,
    ).toBe(403);
  });
});
