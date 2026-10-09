import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { transaction, audit } from '../database/client';
import { HttpError } from '../http';
import { assertAdministrator } from '../auth/identity';
import type { Grant, CourseRelease } from '../learning/types';
export const accessInput = z.object({
  action: z.enum(['grant', 'upgrade', 'extend', 'revoke', 'restore', 'migrate']),
  grantId: z.uuid().optional(),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  courseId: z.string().min(1),
  releaseId: z.string().optional(),
  lessonIds: z.array(z.string()).optional(),
  packageName: z.string().min(1).max(100),
  expiresAt: z.iso.datetime().nullable(),
  reason: z.string().trim().min(3).max(1000),
});
export async function manageAccess(input: unknown, actorId: string) {
  const value = accessInput.parse(input),
    email = value.email.trim().toLowerCase();
  return transaction(async (db) => {
    await assertAdministrator(db, actorId);
    if (value.grantId)
      await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['grant:' + value.grantId]);
    const before = value.grantId
      ? (
          await db.query<Grant>('SELECT * FROM academy.grants WHERE id=$1 FOR UPDATE', [
            value.grantId,
          ])
        ).rows[0]
      : undefined;
    if (value.action === 'grant' && before) {
      if (
        before.email === email &&
        before.course_id === value.courseId &&
        before.source === 'admin' &&
        before.reason === value.reason &&
        before.release_id === value.releaseId &&
        before.package_name === value.packageName &&
        JSON.stringify(before.lesson_ids) === JSON.stringify(value.lessonIds) &&
        (before.expires_at ? new Date(before.expires_at).toISOString() : null) ===
          (value.expiresAt ? new Date(value.expiresAt).toISOString() : null)
      )
        return before;
      throw new HttpError(409, 'Цей запит уже використано');
    }
    if (
      value.action !== 'grant' &&
      (!before || before.email !== email || before.course_id !== value.courseId)
    )
      throw new HttpError(404, 'Доступ не знайдено');
    if (value.expiresAt && Date.parse(value.expiresAt) <= Date.now() && value.action !== 'revoke')
      throw new HttpError(400, 'Дата завершення має бути в майбутньому');
    let releaseId = before?.release_id,
      lessonIds = before?.lesson_ids;
    if (['grant', 'upgrade', 'migrate'].includes(value.action)) {
      const release = (
        await db.query<CourseRelease>(
          'SELECT * FROM academy.releases WHERE id=$1 AND course_id=$2',
          [value.releaseId, value.courseId],
        )
      ).rows[0];
      const known = release?.manifest.modules.flatMap((m) => m.lessons.map((l) => l.id)) || [];
      if (!release || !value.lessonIds?.length || value.lessonIds.some((id) => !known.includes(id)))
        throw new HttpError(400, 'Оберіть опубліковані уроки');
      releaseId = release.id;
      lessonIds = value.lessonIds;
    }
    if (value.action === 'restore' && before?.source_order_id) {
      const payment = (
        await db.query('SELECT status FROM academy.transactions WHERE order_id=$1', [
          before.source_order_id,
        ])
      ).rows[0];
      if (payment?.status === 'refunded')
        throw new HttpError(409, 'Оплату повернено. Створіть окремий адміністративний доступ');
    }
    let result;
    if (value.action === 'grant')
      result = await db.query(
        "INSERT INTO academy.grants(id,user_id,email,course_id,release_id,lesson_ids,package_name,source,expires_at,reason) VALUES($8,(SELECT id FROM academy.profiles WHERE email=$1),$1,$2,$3,$4,$5,'admin',$6,$7) RETURNING *",
        [
          email,
          value.courseId,
          releaseId,
          JSON.stringify(lessonIds),
          value.packageName,
          value.expiresAt,
          value.reason,
          value.grantId || randomUUID(),
        ],
      );
    else
      result = await db.query(
        "UPDATE academy.grants SET release_id=$1,lesson_ids=$2,package_name=$3,expires_at=$4,revoked_at=CASE WHEN $5='revoke' THEN now() WHEN $5='restore' THEN NULL ELSE revoked_at END,reason=$6 WHERE id=$7 RETURNING *",
        [
          releaseId,
          JSON.stringify(lessonIds),
          value.packageName,
          value.action === 'revoke' ? before?.expires_at : value.expiresAt,
          value.action,
          value.reason,
          value.grantId,
        ],
      );
    await audit(db, {
      actorId,
      action: 'access.' + value.action,
      target: result.rows[0].id,
      reason: value.reason,
      before,
      after: result.rows[0],
    });
    return result.rows[0];
  });
}
