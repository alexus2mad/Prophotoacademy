# Academy invitations

Granting a course or administrator privileges now queues a Ukrainian invitation
in the same PostgreSQL transaction as the access change. The invitation links to
the current Academy origin's login page. The recipient requests their own email
code there; the invitation itself neither verifies an address nor creates a
profile. Existing pending grants and administrator invitations remain valid and
can be notified using **Надіслати запрошення** in the student card or team table.
There is no automatic bulk backfill.

`src/lib/notifications/invitations.ts` owns the email content and queue policy;
`src/lib/admin/invitations.ts` owns authorized resends. Course-grant retries use a
stable job identifier. Repeated administrator grants do not generate duplicate
mail. Explicit resends are serialized and limited to one per recipient/audience
every two minutes. A resend never grants, restores or extends access.

Delivery rechecks the current grant or administrator invitation before sending.
Revoked/expired course access and canceled administrator invitations invalidate
queued notices. Pending administrator generation markers preserve PostgreSQL
timestamp precision. Verified-email claiming, recent verification for privilege
changes, last-administrator protection and audit records remain unchanged.

The panel distinguishes never queued, queued, retrying, canceled, local-only and
accepted by the email provider. **Передано поштовому сервісу** means Resend accepted
the API request, not that the recipient opened the message or activated an account.
The worker retries failed requests using the same provider idempotency key. The
recipient's first successful OTP login is the only activation step.

## Environment configuration

- Supabase SMTP sends authentication codes. It does not send application invitations.
- `INVITATION_RESEND_API_KEY` and `INVITATION_EMAIL_FROM` configure invitations only.
  They never authorize purchase emails, Make webhooks or payment activity.
- Staging keeps `NOTIFICATION_MODE=local`, mock payments and no general Resend/Make
  credentials. Its separate sending-only Resend credential is scoped to
  `mail.prophotoacademy.com.ua`; its From value is
  `ProPhoto Academy Staging <login@mail.prophotoacademy.com.ua>`.
- The staging guard rejects an incomplete invitation configuration or any other
  sender. The key is held only in the root-protected runtime environment; never
  put it in source, fixtures, screenshots or logs.
- Application mutations schedule delivery after commit. The isolated
  `prophotoacademy-staging-email.timer` retries every five minutes through port 3141
  using staging's cron credential. It cannot read production configuration.
- Production purchase-email behavior is unchanged. Its current runtime uses
  `NOTIFICATION_MODE=local` with existing general email credentials, so a future
  production invitation release needs explicit invitation credentials configured
  before activation. Do not change payment/email modes merely to enable invitations.

Check provider events when investigating actual delivery. Never tell the manager
that a pending account proves a message was sent. Never send historical invitations
in bulk during deployment, or remove verification to work around missing mail.
