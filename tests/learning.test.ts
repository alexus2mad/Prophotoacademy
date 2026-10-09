import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { claimIdentity, changeAdministrator, safeReturnTo } from '../src/lib/auth/identity';
import { fulfillOrder } from '../src/lib/commerce/orders';
import { accessDates, canReadLesson } from '../src/lib/learning/access';
import {
  applyProgress,
  lessonFraction,
  rangeSeconds,
  studyBudget,
} from '../src/lib/learning/progress';
import type { SqlConnection } from '../src/lib/database/types';
import type { Grant, Lesson, ProgressEvent } from '../src/lib/learning/types';
import type { Order } from '../src/lib/ledger/types';
const pg = new PGlite();
const adminId = '00000000-0000-4000-8000-000000000001',
  studentId = '00000000-0000-4000-8000-000000000002';
const db: SqlConnection = {
  query: async (text, values) => {
    const r = await pg.query(text, values);
    return { ...r, rowCount: r.affectedRows || r.rows.length } as never;
  },
};
const lesson: Lesson = {
  id: 'lesson',
  title: 'Lesson',
  summary: '',
  blocks: [
    { id: 'video', kind: 'video', title: 'Video', required: true, revision: 1, duration: 100 },
  ],
};
const event: ProgressEvent = {
  id: 'id',
  sessionId: 'session',
  sequence: 1,
  blockId: 'video',
  revision: 1,
  elapsed: 30,
  ranges: [[0, 30]],
  position: 30,
};
beforeAll(async () => {
  await pg.exec(await readFile('supabase/migrations/202610090001_learning.sql', 'utf8'));
});
afterAll(async () => {
  await pg.close();
});
describe('email identity and administrator delegation', () => {
  it('bootstraps only the verified configured identity and preserves stable user IDs', async () => {
    const student = await claimIdentity(
      db,
      { id: studentId, email: '  STUDENT@example.com ', verifiedAt: new Date().toISOString() },
      'alex.maksiutenko@gmail.com',
    );
    expect(student.role).toBe('student');
    expect(student.email).toBe('student@example.com');
    const admin = await claimIdentity(
      db,
      { id: adminId, email: 'alex.maksiutenko@gmail.com', verifiedAt: new Date().toISOString() },
      'alex.maksiutenko@gmail.com',
    );
    expect(admin.role).toBe('admin');
  });
  it('prevents removing the last administrator and prevents student escalation', async () => {
    await expect(
      changeAdministrator(db, adminId, 'alex.maksiutenko@gmail.com', false, 'test'),
    ).rejects.toThrow('останнього');
    await expect(
      changeAdministrator(db, studentId, 'student@example.com', true, 'test'),
    ).rejects.toThrow('Administrator');
  });
  it('grants the same rights and does not bootstrap a revoked administrator again', async () => {
    await changeAdministrator(db, adminId, 'student@example.com', true, 'Delegation');
    await changeAdministrator(db, studentId, 'alex.maksiutenko@gmail.com', false, 'Removal');
    const former = await claimIdentity(
      db,
      { id: adminId, email: 'alex.maksiutenko@gmail.com', verifiedAt: new Date().toISOString() },
      'alex.maksiutenko@gmail.com',
    );
    expect(former.role).toBe('student');
  });
  it('rejects open redirects', () => {
    expect(safeReturnTo('//evil.test')).toBe('/account');
    expect(safeReturnTo('/learn/course/lesson')).toBe('/learn/course/lesson');
  });
});
describe('payment fulfillment and access', () => {
  it('grants once, claims guest access after login, and revokes only the refunded purchase', async () => {
    await pg.exec(
      "INSERT INTO academy.courses(id,program_id,title) VALUES('course','program','Course'); INSERT INTO academy.releases(id,course_id,version,manifest) VALUES('release','course',1,'{}');",
    );
    const order: Order = {
      id: 'order',
      tokenHash: 'hash',
      idempotencyKey: 'key',
      fingerprint: 'fp',
      offeringId: 'intake',
      packageId: 'base',
      programId: 'program',
      programTitle: 'Course',
      packageName: 'Base',
      amount: 10,
      currency: 'UAH',
      customer: { email: 'guest@example.com', name: 'Guest', phone: '' },
      status: 'approved',
      mode: 'wayforpay',
      createdAt: 100,
      fulfillment: {
        courseId: 'course',
        releaseId: 'release',
        lessonIds: ['lesson'],
        accessMonths: 5,
        startsAt: null,
      },
    };
    await db.query(
      'INSERT INTO academy.orders(id,token_hash,idempotency_key,fingerprint,data) VALUES($1,$2,$3,$4,$5)',
      [order.id, order.tokenHash, order.idempotencyKey, order.fingerprint, JSON.stringify(order)],
    );
    await fulfillOrder(db, order, 'approved', 'merchant');
    await fulfillOrder(db, order, 'approved', 'merchant');
    expect((await pg.query('SELECT * FROM academy.grants')).rows).toHaveLength(1);
    const guestId = '00000000-0000-4000-8000-000000000003';
    await claimIdentity(
      db,
      { id: guestId, email: 'guest@example.com', verifiedAt: new Date().toISOString() },
      'bootstrap@example.com',
    );
    expect((await pg.query<Grant>('SELECT * FROM academy.grants')).rows[0].user_id).toBe(guestId);
    await db.query(
      "INSERT INTO academy.grants(user_id,email,course_id,release_id,lesson_ids,package_name,source) VALUES($1,'guest@example.com','course','release','[\"lesson\"]','Gift','admin')",
      [guestId],
    );
    await fulfillOrder(db, order, 'refunded', 'merchant');
    const grants = (await pg.query<Grant>('SELECT * FROM academy.grants')).rows;
    expect(grants.find((g) => g.source === 'purchase')?.revoked_at).toBeTruthy();
    expect(grants.find((g) => g.source === 'admin')?.revoked_at).toBeNull();
    await fulfillOrder(db, order, 'approved', 'merchant');
    expect(
      (await pg.query<Grant>("SELECT * FROM academy.grants WHERE source='purchase'")).rows[0]
        .revoked_at,
    ).toBeTruthy();
  });
  it('clamps month-end access periods and starts after a future cohort start', () => {
    expect(accessDates('2026-01-31T10:00:00Z', 1, null).expiresAt).toBe('2026-02-28T10:00:00.000Z');
    expect(accessDates('2026-01-01T10:00:00Z', null, '2026-02-01T10:00:00Z').startsAt).toBe(
      '2026-02-01T10:00:00.000Z',
    );
  });
  it('denies expired, revoked, wrong-package, and scheduled lessons', () => {
    const grant = {
      lesson_ids: ['lesson'],
      starts_at: '2020-01-01',
      expires_at: null,
      revoked_at: null,
    } as Grant;
    expect(canReadLesson([grant], lesson)).toBe(true);
    expect(canReadLesson([{ ...grant, revoked_at: '2026-01-01' }], lesson)).toBe(false);
    expect(canReadLesson([{ ...grant, expires_at: '2020-02-01' }], lesson)).toBe(false);
    expect(canReadLesson([{ ...grant, lesson_ids: [] }], lesson)).toBe(false);
    expect(canReadLesson([grant], { ...lesson, releaseAt: '2099-01-01' })).toBe(false);
  });
});
describe('intelligent progress', () => {
  it('credits interrupted sessions but not overlapping tabs or duplicated coverage', () => {
    const now = Date.parse('2026-10-09T12:00:00Z');
    const first = studyBudget(
      { blocks: {} },
      { ...event, elapsed: 10, observedAt: '2026-10-09T11:59:40Z' },
      now,
    );
    expect(first.elapsed).toBe(10);
    const duplicate = studyBudget(
      { blocks: {}, studyRanges: first.ranges },
      { ...event, elapsed: 10, observedAt: '2026-10-09T11:59:40Z' },
      now,
    );
    expect(duplicate.elapsed).toBe(0);
    const next = studyBudget(
      { blocks: {}, studyRanges: first.ranges },
      { ...event, elapsed: 10, observedAt: '2026-10-09T11:59:45Z' },
      now,
    );
    expect(next.elapsed).toBe(5);
  });
  it('merges replay and refuses credit for a seek beyond the elapsed budget', () => {
    let state = applyProgress(lesson, { blocks: {} }, event, 30);
    state = applyProgress(lesson, state, event, 30);
    expect(rangeSeconds(state.blocks.video.ranges)).toBe(30);
    state = applyProgress(lesson, state, { ...event, ranges: [[30, 100]], elapsed: 1 }, 1);
    expect(rangeSeconds(state.blocks.video.ranges)).toBe(30);
    state = applyProgress(lesson, state, { ...event, ranges: [[30, 90]], elapsed: 30 }, 30);
    expect(lessonFraction(lesson, state)).toBe(1);
  });
  it('does not count an opened PDF or stale media revision', () => {
    const pdf: Lesson = {
      ...lesson,
      blocks: [
        {
          id: 'pdf',
          kind: 'pdf',
          title: 'PDF',
          required: true,
          revision: 2,
          pageSeconds: [10, 10],
        },
      ],
    };
    expect(lessonFraction(pdf, { blocks: {} })).toBe(0);
    expect(() =>
      applyProgress(pdf, { blocks: {} }, { ...event, blockId: 'pdf', revision: 1 }, 10),
    ).toThrow('змінився');
  });
  it('retains explicit student confirmation for offline or accessible reading', () => {
    const state = applyProgress(lesson, { blocks: {} }, { ...event, manual: true }, 0);
    expect(state.manual).toBe('student');
    expect(lessonFraction(lesson, state)).toBe(1);
    expect(
      lessonFraction(
        { ...lesson, blocks: lesson.blocks.map((b) => ({ ...b, revision: 2 })) },
        state,
      ),
    ).toBe(0);
  });
});
