import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import seed from '../content/academy.json';
import { POST as adminAction } from '../src/app/api/admin/[action]/route';
import { GET as roster } from '../src/app/api/admin/roster/route';
import { HttpError } from '../src/lib/http';
import { deliverNotifications } from '../src/lib/notifications/delivery';
import { invitationStatus } from '../src/lib/notifications/invitations';
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
    'TRUNCATE academy.outbox,academy.attendance,academy.live_sessions,academy.grants,academy.releases,academy.courses,academy.admin_invitations,academy.audit,academy.profiles CASCADE',
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
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
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
      (await post('invitation', { email: 'student@example.test', audience: 'student' })).status,
    ).toBe(403);
    expect(
      (await roster(new Request(`${origin}/api/admin/roster?sessionId=${session}`))).status,
    ).toBe(403);
  });
});

describe('transactional administrator invitations', () => {
  it('queues a grant exactly once and keeps identity verification separate', async () => {
    const input = grant({ email: 'new@example.test' });
    expect((await post('access', input)).status).toBe(200);
    expect((await post('access', input)).status).toBe(200);
    const jobs = (await pg.query('SELECT kind,data FROM academy.outbox')).rows;
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      kind: 'access-invitation',
      data: {
        customer: { email: 'new@example.test' },
        grantId: input.grantId,
        programTitle: 'Курс',
      },
    });
    expect(JSON.stringify(jobs)).not.toContain('Оплата на рахунок');
    expect(
      (await pg.query("SELECT id FROM academy.profiles WHERE email='new@example.test'")).rows,
    ).toHaveLength(0);
    expect((await pg.query('SELECT user_id FROM academy.grants')).rows).toEqual([
      { user_id: null },
    ]);
  });
  it('queues administrator invitations only on a new delegation', async () => {
    const input = { email: 'new@example.test', grant: true, reason: 'Новий викладач' };
    expect((await post('team', input)).status).toBe(428);
    expect((await pg.query('SELECT id FROM academy.outbox')).rows).toHaveLength(0);
    auth.fresh = true;
    expect((await post('team', input)).status).toBe(200);
    expect((await post('team', input)).status).toBe(200);
    expect((await pg.query('SELECT id FROM academy.outbox')).rows).toHaveLength(1);
    expect(
      (await pg.query("SELECT id FROM academy.profiles WHERE email='new@example.test'")).rows,
    ).toHaveLength(0);
    const promotion = { ...input, email: 'student@example.test' };
    expect((await post('team', promotion)).status).toBe(200);
    expect((await post('team', promotion)).status).toBe(200);
    expect((await pg.query('SELECT id FROM academy.outbox')).rows).toHaveLength(2);
  });
  it('rolls back the access grant when its durable invitation cannot be queued', async () => {
    await pg.exec(
      "CREATE FUNCTION reject_test_outbox() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic queue failure'; END $$; CREATE TRIGGER reject_test_outbox BEFORE INSERT ON academy.outbox FOR EACH ROW EXECUTE FUNCTION reject_test_outbox();",
    );
    try {
      expect((await post('access', grant())).status).toBe(500);
      expect((await pg.query('SELECT id FROM academy.grants')).rows).toHaveLength(0);
      expect((await pg.query('SELECT id FROM academy.audit')).rows).toHaveLength(0);
    } finally {
      await pg.exec(
        'DROP TRIGGER reject_test_outbox ON academy.outbox; DROP FUNCTION reject_test_outbox()',
      );
    }
  });
  it('resends existing invitations without granting rights and rate-limits repeats', async () => {
    await pg.query('INSERT INTO academy.admin_invitations(email,invited_by) VALUES($1,$2)', [
      'new@example.test',
      admin,
    ]);
    const input = { email: 'NEW@example.test ', audience: 'admin' };
    expect((await post('invitation', input)).status).toBe(200);
    expect((await post('invitation', input)).status).toBe(429);
    expect(
      (await post('invitation', { email: 'unknown@example.test', audience: 'admin' })).status,
    ).toBe(409);
    expect(
      (await post('invitation', { email: 'unknown@example.test', audience: 'student' })).status,
    ).toBe(409);
    expect((await pg.query('SELECT id FROM academy.outbox')).rows).toHaveLength(1);
    expect(
      (await pg.query("SELECT id FROM academy.profiles WHERE email='new@example.test'")).rows,
    ).toHaveLength(0);
    expect((await pg.query('SELECT id FROM academy.grants')).rows).toHaveLength(0);
  });
  it('deduplicates concurrent explicit resend requests', async () => {
    await pg.query('INSERT INTO academy.admin_invitations(email,invited_by) VALUES($1,$2)', [
      'new@example.test',
      admin,
    ]);
    const requests = await Promise.all(
      [0, 1].map(() => post('invitation', { email: 'new@example.test', audience: 'admin' })),
    );
    expect(requests.map((response) => response.status).sort()).toEqual([200, 429]);
    expect((await pg.query('SELECT id FROM academy.outbox')).rows).toHaveLength(1);
  });
});

describe('invitation delivery', () => {
  const configureInvitations = () => {
    vi.stubEnv('NOTIFICATION_MODE', 'local');
    vi.stubEnv('INVITATION_RESEND_API_KEY', 'isolated-invitation-test-key');
    vi.stubEnv('INVITATION_EMAIL_FROM', 'Academy Staging <login@example.test>');
  };
  it('retries failures with the same idempotency key and exposes honest queue status', async () => {
    configureInvitations();
    await post('access', grant());
    const send = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', send);
    expect((await invitationStatus(sql, 'student@example.test', 'student')).state).toBe('pending');
    expect(await deliverNotifications()).toEqual({ delivered: 0 });
    expect((await invitationStatus(sql, 'student@example.test', 'student')).state).toBe('retrying');
    await pg.exec("UPDATE academy.outbox SET next_attempt=now()-interval '1 second'");
    expect(await deliverNotifications()).toEqual({ delivered: 1 });
    expect((await invitationStatus(sql, 'student@example.test', 'student')).state).toBe('sent');
    expect(send.mock.calls[0][1].headers['Idempotency-Key']).toBe(
      send.mock.calls[1][1].headers['Idempotency-Key'],
    );
    expect(await deliverNotifications()).toEqual({ delivered: 0 });
    expect(send).toHaveBeenCalledTimes(2);
  });
  it('delivers a newly delegated administrator invitation without creating a profile', async () => {
    configureInvitations();
    auth.fresh = true;
    expect(
      (await post('team', { email: 'new@example.test', grant: true, reason: 'Запрошення' })).status,
    ).toBe(200);
    expect(
      (
        await pg.query(
          "SELECT i.created_at=(o.data->>'invitationCreatedAt')::timestamptz AS exact FROM academy.admin_invitations i JOIN academy.outbox o ON o.data->'customer'->>'email'=i.email",
        )
      ).rows,
    ).toEqual([{ exact: true }]);
    const send = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', send);
    expect(await deliverNotifications()).toEqual({ delivered: 1 });
    expect(JSON.parse(send.mock.calls[0][1].body).to).toEqual(['new@example.test']);
    expect(
      (await pg.query("SELECT id FROM academy.profiles WHERE email='new@example.test'")).rows,
    ).toHaveLength(0);
  });
  it('cancels queued notices after grant revocation or invitation withdrawal', async () => {
    configureInvitations();
    const input = grant();
    await post('access', input);
    await post('access', { ...input, action: 'revoke', reason: 'Доступ скасовано' });
    auth.fresh = true;
    await post('team', { email: 'new@example.test', grant: true, reason: 'Запрошення' });
    await post('team', { email: 'new@example.test', grant: false, reason: 'Скасування' });
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    expect(await deliverNotifications()).toEqual({ delivered: 0 });
    expect(send).not.toHaveBeenCalled();
    expect((await pg.query('SELECT state FROM academy.outbox')).rows).toEqual([
      { state: 'canceled' },
      { state: 'canceled' },
    ]);
  });
  it('preserves database timestamp precision and rejects a replaced invitation generation', async () => {
    configureInvitations();
    await pg.query(
      "INSERT INTO academy.admin_invitations(email,invited_by,created_at) VALUES('precise@example.test',$1,'2026-10-28 15:00:00.123456+00'),('replaced@example.test',$1,'2026-10-28 15:00:00.123456+00')",
      [admin],
    );
    for (const email of ['precise@example.test', 'replaced@example.test'])
      expect((await post('invitation', { email, audience: 'admin' })).status).toBe(200);
    await pg.exec(
      "UPDATE academy.admin_invitations SET created_at='2026-10-28 15:00:00.123789+00' WHERE email='replaced@example.test'",
    );
    const send = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', send);
    expect(await deliverNotifications()).toEqual({ delivered: 1 });
    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(send.mock.calls[0][1].body).to).toEqual(['precise@example.test']);
    expect((await invitationStatus(sql, 'replaced@example.test', 'admin')).state).toBe('canceled');
  });
  it('does not send invitations for expired grants', async () => {
    configureInvitations();
    await post('access', grant());
    await pg.exec(
      "UPDATE academy.grants SET starts_at=now()-interval '2 days',expires_at=now()-interval '1 day'",
    );
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    expect(await deliverNotifications()).toEqual({ delivered: 0 });
    expect(send).not.toHaveBeenCalled();
    expect((await invitationStatus(sql, 'student@example.test', 'student')).state).toBe('canceled');
  });
  it('uses isolated invitation credentials without sending mock purchases or enabling generic email', async () => {
    configureInvitations();
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('EMAIL_FROM', '');
    await post('access', grant());
    await pg.query(
      "INSERT INTO academy.outbox(id,kind,data) VALUES('mock','order-status',$1),('purchase','order-status',$2)",
      [
        JSON.stringify({
          mode: 'mock',
          status: 'approved',
          customer: { email: 'buyer@example.test' },
        }),
        JSON.stringify({
          mode: 'wayforpay',
          status: 'approved',
          customer: { email: 'buyer@example.test' },
        }),
      ],
    );
    const send = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', send);
    expect(await deliverNotifications()).toEqual({ delivered: 1 });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][1].headers.Authorization).toBe('Bearer isolated-invitation-test-key');
    expect(JSON.parse(send.mock.calls[0][1].body).to).toEqual(['student@example.test']);
    expect((await pg.query("SELECT state FROM academy.outbox WHERE id='mock'")).rows[0]).toEqual({
      state: 'local',
    });
    expect(
      (await pg.query("SELECT state,attempts FROM academy.outbox WHERE id='purchase'")).rows[0],
    ).toEqual({ state: 'pending', attempts: 1 });
  });
  it('cannot borrow general email credentials for local invitation sending', async () => {
    vi.stubEnv('NOTIFICATION_MODE', 'local');
    vi.stubEnv('RESEND_API_KEY', 'production-test-key');
    vi.stubEnv('EMAIL_FROM', 'Production <production@example.test>');
    vi.stubEnv('INVITATION_RESEND_API_KEY', '');
    vi.stubEnv('INVITATION_EMAIL_FROM', '');
    await post('access', grant());
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    expect(await deliverNotifications()).toEqual({ delivered: 0 });
    expect(send).not.toHaveBeenCalled();
    expect((await invitationStatus(sql, 'student@example.test', 'student')).state).toBe('retrying');
  });
  it('preserves existing production purchase email behavior with local notification mode', async () => {
    vi.stubEnv('NOTIFICATION_MODE', 'local');
    vi.stubEnv('RESEND_API_KEY', 'existing-production-test-key');
    vi.stubEnv('EMAIL_FROM', 'Academy <login@example.test>');
    await pg.query(
      "INSERT INTO academy.outbox(id,kind,data) VALUES('purchase','order-status',$1)",
      [
        JSON.stringify({
          mode: 'wayforpay',
          status: 'approved',
          customer: { email: 'buyer@example.test' },
        }),
      ],
    );
    const send = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', send);
    expect(await deliverNotifications()).toEqual({ delivered: 1 });
    expect(send.mock.calls[0][1].headers.Authorization).toBe('Bearer existing-production-test-key');
    expect(JSON.parse(send.mock.calls[0][1].body).to).toEqual(['buyer@example.test']);
  });
});
