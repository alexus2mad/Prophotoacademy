import type { SqlConnection } from '../database/types';
import type { Member, VerifiedIdentity } from './types';
import { audit } from '../database/client';
import { HttpError } from '../http';

export async function assertAdministrator(db: SqlConnection, actorId: string) {
  await db.query('SELECT pg_advisory_xact_lock(710091)');
  const actor = (await db.query<Member>('SELECT * FROM academy.profiles WHERE id=$1', [actorId]))
    .rows[0];
  if (actor?.role !== 'admin') throw new HttpError(403, 'Administrator required');
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export function safeReturnTo(value: string | null | undefined) {
  return value && /^\/(account|learn|admin)(\/|\?|$)/.test(value) && !value.includes('\\')
    ? value
    : '/account';
}
export async function claimIdentity(
  db: SqlConnection,
  identity: VerifiedIdentity,
  bootstrapEmail: string,
) {
  const email = normalizeEmail(identity.email);
  // Serialize first-admin creation and invitation claiming; never re-elevate a removed admin.
  await db.query('SELECT pg_advisory_xact_lock(710091)');
  const existing = await db.query<Member>('SELECT * FROM academy.profiles WHERE id=$1 FOR UPDATE', [
    identity.id,
  ]);
  if (existing.rows[0] && existing.rows[0].email !== email)
    throw new Error('Account email changes require support');
  await db.query(
    'INSERT INTO academy.profiles(id,email,verified_at) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING',
    [identity.id, email, identity.verifiedAt],
  );
  const bootstrapped = await db.query(
    "SELECT key FROM academy.settings WHERE key='admin-bootstrapped'",
  );
  const invitation = await db.query(
    'SELECT email FROM academy.admin_invitations WHERE email=$1 AND claimed_at IS NULL',
    [email],
  );
  if ((!bootstrapped.rowCount && email === normalizeEmail(bootstrapEmail)) || invitation.rowCount) {
    await db.query("UPDATE academy.profiles SET role='admin' WHERE id=$1", [identity.id]);
    await db.query(
      "INSERT INTO academy.settings(key,value) VALUES('admin-bootstrapped',$1) ON CONFLICT DO NOTHING",
      [JSON.stringify({ userId: identity.id })],
    );
    await db.query('UPDATE academy.admin_invitations SET claimed_at=now() WHERE email=$1', [email]);
    await audit(db, {
      actorId: identity.id,
      action: 'admin.claim',
      target: identity.id,
      after: { role: 'admin' },
    });
  }
  await db.query('UPDATE academy.grants SET user_id=$1 WHERE email=$2 AND user_id IS NULL', [
    identity.id,
    email,
  ]);
  return (await db.query<Member>('SELECT * FROM academy.profiles WHERE id=$1', [identity.id]))
    .rows[0];
}
export async function changeAdministrator(
  db: SqlConnection,
  actorId: string,
  emailInput: string,
  grant: boolean,
  reason: string,
) {
  const email = normalizeEmail(emailInput);
  await assertAdministrator(db, actorId);
  const target = (
    await db.query<Member>('SELECT * FROM academy.profiles WHERE email=$1 FOR UPDATE', [email])
  ).rows[0];
  if (!grant && target?.role === 'admin') {
    const count = await db.query(
      "SELECT count(*)::int AS count FROM academy.profiles WHERE role='admin'",
    );
    if (count.rows[0].count <= 1)
      throw new HttpError(409, 'Не можна видалити останнього адміністратора');
  }
  if (target)
    await db.query('UPDATE academy.profiles SET role=$1 WHERE id=$2', [
      grant ? 'admin' : 'student',
      target.id,
    ]);
  else if (grant)
    await db.query(
      'INSERT INTO academy.admin_invitations(email,invited_by) VALUES($1,$2) ON CONFLICT(email) DO UPDATE SET invited_by=excluded.invited_by,claimed_at=NULL',
      [email, actorId],
    );
  if (!grant) await db.query('DELETE FROM academy.admin_invitations WHERE email=$1', [email]);
  await audit(db, {
    actorId,
    action: grant ? 'admin.grant' : 'admin.revoke',
    target: email,
    reason,
    before: target?.role,
    after: grant ? 'admin' : 'student',
  });
}
