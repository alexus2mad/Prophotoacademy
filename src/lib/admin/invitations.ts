import { z } from 'zod';
import { assertAdministrator } from '../auth/identity';
import { audit, transaction } from '../database/client';
import { HttpError } from '../http';
import { invitationKind, queueInvitation } from '../notifications/invitations';

export async function resendInvitation(input: unknown, actorId: string) {
  const value = z
    .object({
      email: z.string().trim().toLowerCase().pipe(z.email()),
      audience: z.enum(['student', 'admin']),
    })
    .parse(input);
  return transaction(async (db) => {
    await assertAdministrator(db, actorId);
    await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      'invitation:' + value.audience + ':' + value.email,
    ]);
    const recent = await db.query(
      "SELECT id FROM academy.outbox WHERE kind=$1 AND data->'customer'->>'email'=$2 AND (data->>'requestedAt')::timestamptz>now()-interval '2 minutes' LIMIT 1",
      [invitationKind(value.audience), value.email],
    );
    if (recent.rowCount)
      throw new HttpError(
        429,
        'Запрошення вже надіслано в чергу. Спробуйте ще раз через 2 хвилини',
      );
    if (value.audience === 'student') {
      const grant = (
        await db.query(
          "SELECT g.id,g.package_name,r.manifest->>'title' AS title FROM academy.grants g JOIN academy.releases r ON r.id=g.release_id WHERE g.email=$1 AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>now()) AND jsonb_array_length(g.lesson_ids)>0 ORDER BY g.created_at DESC LIMIT 1",
          [value.email],
        )
      ).rows[0];
      if (!grant) throw new HttpError(409, 'Спершу надайте чинний доступ до курсу');
      await queueInvitation(db, {
        ...value,
        grantId: grant.id,
        programTitle: grant.title,
        packageName: grant.package_name,
      });
    } else {
      const active = await db.query(
        "SELECT id FROM academy.profiles WHERE email=$1 AND role='admin'",
        [value.email],
      );
      const pending = (
        await db.query(
          'SELECT created_at::text FROM academy.admin_invitations WHERE email=$1 AND claimed_at IS NULL',
          [value.email],
        )
      ).rows[0];
      if (!active.rowCount && !pending)
        throw new HttpError(409, 'Немає чинних прав або запрошення адміністратора');
      await queueInvitation(db, {
        ...value,
        invitationCreatedAt: pending?.created_at,
      });
    }
    await audit(db, {
      actorId,
      action: 'invitation.resend',
      target: value.email,
      after: { audience: value.audience },
    });
    return { queued: true };
  });
}
