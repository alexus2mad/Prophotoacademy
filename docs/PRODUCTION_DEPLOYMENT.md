# Academy production deployment

The selected host is the existing Hetzner server at `46.224.208.120`, SSH port `58222`. The owner approved this change from Vercel on 11 October 2026. Academy runs as a separate service and OS account, alongside ps-booking. Its initial origin is `https://staging.prophotoacademy.com.ua`; the existing public marketing domain is not cut over by this setup.

The owner explicitly requested a staging subdomain while the existing Webflow site stays operational. Keep the apex and `www` DNS records and existing mail routing unchanged. The staging HTTPS host sends `X-Robots-Tag: noindex, nofollow, noarchive` on every response. Payment mode remains mock until a separate activation.

## Services and configuration

- Application: `prophotoacademy.service`, loopback port `3140`, OS account `prophotoacademy`
- Releases: `/srv/prophotoacademy/releases/<commit>`; `/srv/prophotoacademy/current` selects the active release
- Runtime configuration: `/etc/prophotoacademy/runtime.env`, root-owned mode `600`; use `deploy/runtime.env.example` for variable names
- TLS trust: `/etc/prophotoacademy/supabase-ca.crt`; PostgreSQL uses `sslmode=verify-full`
- Nginx templates: `deploy/nginx-http.conf` for ACME setup, then `deploy/nginx-https.conf`
- Email retries: `prophotoacademy-email.timer` calls the existing authenticated cron route every five minutes through loopback
- Booking integration: booking `ACADEMY_ORIGIN` points to the Academy HTTPS origin; its `ACADEMY_MANAGEMENT_SECRET` must equal Academy `PS_BOOKING_MANAGEMENT_SECRET`

Keep runtime files, database credentials, provider tokens and private learner data outside Git. Do not copy the local sandbox or `.data` into a release. Use a Git archive of the tested commit; install the lockfile with pnpm, run the build as the application account, and retain the previous release for rollback. Do not build Linux production dependencies on Windows.

Supply `NODE_EXTRA_CA_CERTS` in the process environment before Node starts, as the systemd unit does. For a manual Node command, export it explicitly before invoking Node; loading that variable only through Node's `--env-file` is too late for extra CA initialization. Keep full TLS verification enabled.

## Provisioned services

The Academy Supabase project is `bydmqmrbfjufsyhlayku`. Migrations through `202610090003` initialize 26 private tables in `academy`. All tables have RLS enabled. The direct database role `prophoto_academy_runtime` has no superuser, database-creation, role-creation, replication or RLS-bypass privileges. It receives only schema usage and table DML through policies explicitly restricted to that role; `academy.migrations` is read-only. `anon` and `authenticated` have no Academy schema access.

Future migrations run separately with the migration owner's credential. When adding a table, enable RLS and add the corresponding server-role policy and grants; never grant student browser roles direct table access to fix an application error. Verify new tables using the runtime role before activating a release.

The `learning` Storage bucket is private, capped at 50 MB, and accepts PDF, JPEG, PNG and WebP. Sanity project `sfzp6094` has a private `learning` dataset for course authoring and a separate public `production` dataset. The reviewed marketing fixture remains active until the marketing content migration is explicitly activated.

Resend uses the sending-only domain `mail.prophotoacademy.com.ua`. Verify its DNS records, configure Supabase SMTP, and replace the signup and magic-link templates with a code-based email before inviting students. The first administrator is created only after email verification; provisioning must not insert an already-verified account or role by hand.

## Staging activation record — 11 October 2026

The staging service is deployed and its HTTPS certificate renews through Certbot. Public `/api/health` returns success and the staging response includes the noindex header. The existing apex still resolves to `198.202.211.1`, `www` remains `cdn.webflow.com`, and the existing mailbox MX is preserved.

All four Resend records are verified. Supabase custom SMTP uses `smtp.resend.com:465`, sender `ProPhoto Academy <login@mail.prophotoacademy.com.ua>`, and Ukrainian code templates for signup and subsequent login. Email verification is required; anonymous sign-in and manual identity linking remain disabled. Codes contain eight digits and expire after ten minutes. The first signup-code email was confirmed delivered by Resend. The five-minute outbox timer is enabled and its first run succeeded.

Live checks confirm that anonymous course-admin and email-job requests fail with 401, unsigned management requests fail with 401, a valid integration signature still requires an administrator session, and nonce reuse fails with 409. This verifies the deployed database role's access to the management nonce table as well as the HTTP boundary.

The first administrator completed the normal email-code flow. The database confirms the admin role and one-time initialization marker. An unpublished “Інста, яка продає” draft (`14b4ebf5-33b1-4026-ac67-099eecfddca3`) was created through the authenticated editor and private Sanity connection, with three modules and six lesson outlines. Teaching content and package mappings remain unpublished.

The two applications share a private management secret through their root-owned runtime files. Booking release `ae2ee13` (`1.11.004`) deployed successfully through its existing GitHub Actions workflow. Its Academy status reports configured, and the course-authoring link redirects to staging. The booking administrator session must still be checked through its separate email-code flow. No studio-manager, cashbox or merchant configuration was changed.

## Verification and rollback

Run architecture checks, TypeScript, relevant tests, production build and the static review export before release. `/api/health` verifies database connectivity and the management migration; it returns no configuration or customer data and is not cached. This health check does not certify SMTP delivery, payment readiness, or media-provider configuration.

After deployment, verify the health endpoint, login, management bridge, course authoring, private media authorization and an actual administrator email-code login. Enable the email timer only after sender configuration is verified. Keep payments disabled until the separate payment release checks pass. Mux video upload/playback also requires its own credentials before video lessons can be published.

Rollback switches `current` to the prior verified release and restarts `prophotoacademy.service`. Database migrations are not rolled back automatically. Booking's service, schema, payment configuration and release directory remain independent.
