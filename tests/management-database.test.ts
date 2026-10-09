import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { createHmac, randomUUID, createHash } from 'node:crypto';
import type { SqlConnection } from '../src/lib/database/types';
import type { AccessChangeInput } from './types';
const database = vi.hoisted(() => ({ connection: null as SqlConnection | null }));
vi.mock('../src/lib/database/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/database/client')>();
  return {
    ...actual,
    databasePool: () => database.connection,
    transaction: async (work: (db: SqlConnection) => Promise<unknown>) => {
      const db = database.connection!;
      await db.query('BEGIN');
      try {
        const result = await work(db);
        await db.query('COMMIT');
        return result;
      } catch (e) {
        await db.query('ROLLBACK');
        throw e;
      }
    },
  };
});
vi.mock('../src/lib/content', () => ({
  getContent: async () => ({ programs: [], offerings: [] }),
}));
import { manageAccess } from '../src/lib/admin/access';
import { customerAccounts } from '../src/lib/admin/customer-account';
import { acceptManagementRequest, managementAction } from '../src/lib/admin/management';
import { saveProgress } from '../src/lib/learning/service';
const pg = new PGlite(),
  admin = '00000000-0000-4000-8000-000000000101',
  student = '00000000-0000-4000-8000-000000000102';
const secret = 'synthetic-integration-key-at-least-32-characters',
  token = 'synthetic-admin-session';
beforeAll(async () => {
  database.connection = {
    query: async (text, values) => {
      const r = await pg.query(text, values);
      return { ...r, rowCount: r.affectedRows || r.rows.length } as never;
    },
  };
  for (const file of [
    '202610090001_learning.sql',
    '202610090002_authoring.sql',
    '202610090003_booking_management.sql',
  ])
    await pg.exec(await readFile('supabase/migrations/' + file, 'utf8'));
  await pg.query(
    "INSERT INTO academy.profiles(id,email,role,verified_at) VALUES($1,'admin@example.com','admin',now()),($2,'student@example.com','student',now())",
    [admin, student],
  );
  await pg.exec(
    "INSERT INTO academy.courses(id,program_id,title) VALUES('course','program','Course')",
  );
  await pg.query(
    "INSERT INTO academy.releases(id,course_id,version,manifest) VALUES('release','course',1,$1)",
    [
      JSON.stringify({
        id: 'course',
        programId: 'program',
        title: 'Course',
        modules: [
          {
            id: 'module',
            title: 'Module',
            lessons: [
              {
                id: 'lesson',
                title: 'Lesson',
                summary: '',
                blocks: [
                  {
                    id: 'image',
                    kind: 'image',
                    title: 'Image',
                    required: true,
                    revision: 1,
                    expectedSeconds: 5,
                  },
                ],
              },
            ],
          },
        ],
      }),
    ],
  );
  await pg.query(
    "INSERT INTO academy.management_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 day')",
    [createHash('sha256').update(token).digest('hex'), admin],
  );
  vi.stubEnv('PS_BOOKING_MANAGEMENT_SECRET', secret);
});
afterAll(async () => {
  vi.unstubAllEnvs();
  await pg.close();
});
const access: AccessChangeInput = {
  action: 'grant',
  grantId: randomUUID(),
  email: 'student@example.com',
  courseId: 'course',
  releaseId: 'release',
  lessonIds: ['lesson'],
  packageName: 'BASE',
  expiresAt: null,
  reason: 'Synthetic QA grant',
};
describe('management is authorized by verified identity through ps-booking', () => {
  it('rejects unsigned calls, consumes nonces exactly once, and requires a session for reads', async () => {
    const body = JSON.stringify({ action: 'people' }),
      time = String(Date.now()),
      nonce = randomUUID(),
      headers = new Headers({
        'x-prophoto-time': time,
        'x-prophoto-nonce': nonce,
        'x-prophoto-signature': createHmac('sha256', secret)
          .update(time + '\n' + nonce + '\n' + body)
          .digest('hex'),
      });
    await expect(acceptManagementRequest(body, new Headers())).rejects.toThrow();
    expect((await acceptManagementRequest(body, headers)).action).toBe('people');
    await expect(acceptManagementRequest(body, headers)).rejects.toThrow('Replayed');
    await expect(managementAction('people', {})).rejects.toThrow('email');
    const result = await managementAction('people', {}, token);
    expect(result).toHaveProperty('people');
  });
  it('makes grants idempotent, refuses payload reuse, and prevents student escalation', async () => {
    await expect(manageAccess(access, student)).rejects.toThrow('Administrator');
    await manageAccess(access, admin);
    await manageAccess(access, admin);
    expect((await pg.query('SELECT * FROM academy.grants')).rows).toHaveLength(1);
    await expect(
      manageAccess({ ...access, expiresAt: '2030-01-01T00:00:00Z' }, admin),
    ).rejects.toThrow('використано');
    await expect(
      manageAccess({ ...access, grantId: randomUUID(), lessonIds: ['unknown'] }, admin),
    ).rejects.toThrow('уроки');
  });
  it('records progress once and keeps it when access is revoked and restored', async () => {
    const event = {
      id: randomUUID(),
      sessionId: randomUUID(),
      sequence: 1,
      blockId: 'image',
      revision: 1,
      elapsed: 5,
      observedAt: new Date().toISOString(),
    };
    expect((await saveProgress(student, 'course', 'lesson', event)).completed).toBe(true);
    expect(
      (await saveProgress(student, 'course', 'lesson', event)).state.blocks.image.activeSeconds,
    ).toBe(5);
    await manageAccess({ ...access, action: 'revoke', reason: 'Synthetic revocation' }, admin);
    await expect(
      saveProgress(student, 'course', 'lesson', { ...event, id: randomUUID(), sequence: 2 }),
    ).rejects.toThrow('недоступний');
    await manageAccess({ ...access, action: 'restore', reason: 'Synthetic restoration' }, admin);
    expect(
      (await saveProgress(student, 'course', 'lesson', { ...event, id: randomUUID(), sequence: 2 }))
        .completed,
    ).toBe(true);
    expect(
      (await pg.query("SELECT * FROM academy.audit WHERE action='access.revoke'")).rows,
    ).toHaveLength(1);
  });
  it('returns a narrow account summary with current grants by immutable identity, not grant email', async () => {
    const owner = randomUUID(),
      email = 'crm.student@example.com';
    await pg.query('INSERT INTO academy.profiles(id,email,verified_at) VALUES($1,$2,now())', [
      owner,
      email,
    ]);
    for (const row of [
      [owner, email, 'Lifetime', '-1 day', null, false, '["lesson"]'],
      [owner, email, 'Upcoming', '1 day', '30 days', false, '["lesson"]'],
      [owner, email, 'Expired', '-3 days', '-1 day', false, '["lesson"]'],
      [owner, email, 'Revoked', '-1 day', null, true, '["lesson"]'],
      [owner, email, 'Empty', '-1 day', null, false, '[]'],
      [student, email, 'Wrong identity', '-1 day', null, false, '["lesson"]'],
      [null, 'pending@example.com', 'Pending', '-1 day', null, false, '["lesson"]'],
    ])
      await pg.query(
        `INSERT INTO academy.grants(user_id,email,course_id,release_id,package_name,source,starts_at,expires_at,revoked_at,lesson_ids)
      VALUES($1,$2,'course','release',$3,'admin',now()+$4::interval,now()+$5::interval,CASE WHEN $6 THEN now() END,$7)`,
        row,
      );
    const [account, pending, unknown] = await customerAccounts(database.connection!, [
      email,
      'pending@example.com',
      'crmstudent@example.com',
    ]);
    expect(account).toMatchObject({ userId: owner, email, hasAccount: true });
    expect(account.courses).toHaveLength(1);
    expect(account.courses[0].access.map((a) => a.packageName)).toEqual(['Lifetime', 'Upcoming']);
    expect(pending).toMatchObject({ hasAccount: false, userId: null });
    expect(pending.courses[0].access[0].packageName).toBe('Pending');
    expect(unknown).toMatchObject({ hasAccount: false, courses: [] });
    const result = await managementAction(
      'customer.summary',
      { emails: ['  CRM.Student@EXAMPLE.com  '] },
      token,
    );
    expect(result).toEqual({ accounts: [account] });
    for (const field of ['manifest', 'lesson_ids', 'role', 'purchases', 'progress'])
      expect(JSON.stringify(result)).not.toContain('"' + field + '"');
    await pg.query('UPDATE academy.grants SET revoked_at=now() WHERE user_id=$1', [owner]);
    expect((await customerAccounts(database.connection!, [email]))[0].courses).toEqual([]);
    await expect(managementAction('customer.summary', { emails: [email] })).rejects.toThrow(
      'email',
    );
    await expect(
      managementAction('customer.summary', { emails: Array(21).fill(email) }, token),
    ).rejects.toThrow();
  });
  it('requires fresh verification for privilege changes and honors revoked roles immediately', async () => {
    await pg.exec("UPDATE academy.management_sessions SET verified_at=now()-interval '11 minutes'");
    await expect(
      managementAction(
        'team.change',
        { email: 'student@example.com', grant: true, reason: 'Delegation' },
        token,
      ),
    ).rejects.toThrow('ще раз');
    await pg.query("UPDATE academy.profiles SET role='student' WHERE id=$1", [admin]);
    await expect(managementAction('people', {}, token)).rejects.toThrow('права');
    await expect(
      managementAction('customer.summary', { emails: ['student@example.com'] }, token),
    ).rejects.toThrow('права');
  });
});
