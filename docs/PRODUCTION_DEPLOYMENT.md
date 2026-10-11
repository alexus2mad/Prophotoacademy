# Academy production deployment

The selected host is the existing Hetzner server at `46.224.208.120`, SSH port `58222`. The owner approved this change from Vercel on 11 October 2026. Academy runs as a separate service and OS account, alongside ps-booking. Its initial origin is `https://learn.prophotoacademy.com.ua`; the existing public marketing domain is not cut over by this setup.

## Services and configuration

- Application: `prophotoacademy.service`, loopback port `3140`, OS account `prophotoacademy`
- Releases: `/srv/prophotoacademy/releases/<commit>`; `/srv/prophotoacademy/current` selects the active release
- Runtime configuration: `/etc/prophotoacademy/runtime.env`, root-owned mode `600`; use `deploy/runtime.env.example` for variable names
- TLS trust: `/etc/prophotoacademy/supabase-ca.crt`; PostgreSQL uses `sslmode=verify-full`
- Nginx templates: `deploy/nginx-http.conf` for ACME setup, then `deploy/nginx-https.conf`
- Email retries: `prophotoacademy-email.timer` calls the existing authenticated cron route every five minutes through loopback
- Booking integration: booking `ACADEMY_ORIGIN` points to the Academy HTTPS origin; its `ACADEMY_MANAGEMENT_SECRET` must equal Academy `PS_BOOKING_MANAGEMENT_SECRET`

Keep runtime files, database credentials, provider tokens and private learner data outside Git. Do not copy the local sandbox or `.data` into a release. Use a Git archive of the tested commit; install the lockfile with pnpm, run the build as the application account, and retain the previous release for rollback. Do not build Linux production dependencies on Windows.

## Provisioned services

The Academy Supabase project is `bydmqmrbfjufsyhlayku`. Migrations through `202610090003` initialize 26 private tables in `academy`. All tables have RLS enabled. The direct database role `prophoto_academy_runtime` has no superuser, database-creation, role-creation, replication or RLS-bypass privileges. It receives only schema usage and table DML through policies explicitly restricted to that role; `academy.migrations` is read-only. `anon` and `authenticated` have no Academy schema access.

Future migrations run separately with the migration owner's credential. When adding a table, enable RLS and add the corresponding server-role policy and grants; never grant student browser roles direct table access to fix an application error. Verify new tables using the runtime role before activating a release.

The `learning` Storage bucket is private, capped at 50 MB, and accepts PDF, JPEG, PNG and WebP. Sanity project `sfzp6094` has a private `learning` dataset for course authoring and a separate public `production` dataset. The reviewed marketing fixture remains active until the marketing content migration is explicitly activated.

Resend uses the sending-only domain `mail.prophotoacademy.com.ua`. Verify its DNS records, configure Supabase SMTP, and replace the signup and magic-link templates with a code-based email before inviting students. The first administrator is created only after email verification; provisioning must not insert an already-verified account or role by hand.

## Verification and rollback

Run architecture checks, TypeScript, relevant tests, production build and the static review export before release. `/api/health` verifies database connectivity and the management migration; it returns no configuration or customer data and is not cached. This health check does not certify SMTP delivery, payment readiness, or media-provider configuration.

After deployment, verify the health endpoint, login, management bridge, course authoring, private media authorization and an actual administrator email-code login. Enable the email timer only after sender configuration is verified. Keep payments disabled until the separate payment release checks pass. Mux video upload/playback also requires its own credentials before video lessons can be published.

Rollback switches `current` to the prior verified release and restarts `prophotoacademy.service`. Database migrations are not rolled back automatically. Booking's service, schema, payment configuration and release directory remain independent.
