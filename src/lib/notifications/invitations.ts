import { randomUUID } from 'node:crypto';
import type { SqlConnection } from '../database/types';
import type {
  EmailContent,
  InvitationAudience,
  InvitationInput,
  InvitationJobRow,
  InvitationStatus,
  NotificationJob,
} from './types';

export const invitationKind = (audience: InvitationAudience) =>
  audience === 'admin' ? 'admin-invitation' : 'access-invitation';
export const isInvitation = (kind: string) =>
  kind === 'admin-invitation' || kind === 'access-invitation';

// Called inside the same transaction that grants access or records the invitation.
export async function queueInvitation(
  db: SqlConnection,
  input: InvitationInput,
  id: string = randomUUID(),
) {
  await db.query(
    'INSERT INTO academy.outbox(id,kind,data) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING',
    [
      id,
      invitationKind(input.audience),
      JSON.stringify({
        customer: { email: input.email },
        grantId: input.grantId,
        programTitle: input.programTitle,
        packageName: input.packageName,
        invitationCreatedAt: input.invitationCreatedAt,
        requestedAt: new Date().toISOString(),
      }),
    ],
  );
}

export async function invitationStatus(
  db: SqlConnection,
  email: string,
  audience: InvitationAudience,
): Promise<InvitationStatus> {
  const job = (
    await db.query<InvitationJobRow>(
      "SELECT * FROM academy.outbox WHERE kind=$1 AND data->'customer'->>'email'=$2 ORDER BY data->>'requestedAt' DESC NULLS LAST,id DESC LIMIT 1",
      [invitationKind(audience), email],
    )
  ).rows[0];
  if (!job) return { state: 'none', requestedAt: null };
  return {
    state:
      job.state === 'delivered'
        ? 'sent'
        : job.state === 'canceled'
          ? 'canceled'
          : job.state === 'local'
            ? 'local'
            : job.attempts > 0
              ? 'retrying'
              : 'pending',
    requestedAt: typeof job.data.requestedAt === 'string' ? job.data.requestedAt : null,
  };
}

// A delayed/retried message must not advertise access that has since been canceled.
export async function invitationStillValid(db: SqlConnection, job: NotificationJob) {
  const email = job.data.customer?.email;
  if (!email) return false;
  if (job.kind === 'access-invitation') {
    const grant = await db.query(
      'SELECT g.id FROM academy.grants g JOIN academy.releases r ON r.id=g.release_id WHERE g.id=$1 AND g.email=$2 AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>now()) AND jsonb_array_length(g.lesson_ids)>0',
      [job.data.grantId, email],
    );
    return Boolean(grant.rowCount);
  }
  if (job.kind === 'admin-invitation') {
    const active = await db.query(
      "SELECT email FROM academy.profiles WHERE email=$1 AND role='admin' UNION ALL SELECT email FROM academy.admin_invitations WHERE email=$1 AND claimed_at IS NULL AND ($2::timestamptz IS NULL OR created_at=$2::timestamptz)",
      [email, job.data.invitationCreatedAt || null],
    );
    return Boolean(active.rowCount);
  }
  return false;
}

export function invitationEmail(job: NotificationJob, origin: string): EmailContent | null {
  if (!isInvitation(job.kind) || !job.data.customer?.email) return null;
  const admin = job.kind === 'admin-invitation';
  const staging = new URL(origin).hostname.startsWith('staging.');
  const login = new URL('/login', origin);
  login.searchParams.set('next', admin ? '/admin' : '/account');
  return {
    subject:
      (admin ? 'Запрошення до команди ProPhoto Academy' : 'Вам відкрито доступ до навчання') +
      (staging ? ' · Staging' : ''),
    preheader: 'Перейдіть до кабінету та підтвердьте свій email кодом із листа.',
    heading: admin ? 'Вас запросили до команди' : 'Можна починати навчання',
    paragraphs: [
      admin
        ? 'Вам надали права адміністратора ProPhoto Academy.'
        : 'Адміністратор ProPhoto Academy відкрив вам доступ до курсу.',
      'Натисніть кнопку нижче та введіть цей email на сторінці входу. Ви отримаєте окремий лист із кодом для підтвердження email.',
      'Якщо ви ще не входили до кабінету, акаунт буде створено після підтвердження email. Пароль не потрібен.',
    ],
    details:
      !admin && job.data.programTitle
        ? [
            {
              label: 'Курс',
              value: [job.data.programTitle, job.data.packageName].filter(Boolean).join(' — '),
            },
          ]
        : undefined,
    action: { label: admin ? 'Відкрити адміністрування' : 'Відкрити кабінет', href: login.href },
    note: staging
      ? 'Це запрошення до тестової платформи ProPhoto Academy Staging.'
      : 'Якщо це запрошення було неочікуваним, просто проігноруйте лист або зверніться до академії.',
  };
}
