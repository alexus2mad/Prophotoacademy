# Separate staging and production

## Live topology — 23 October 2026 (Europe/Kyiv)

Both apps run on OVH 54.39.230.141 (SSH 58222), with separate Linux accounts,
processes, release directories, configuration, databases, authentication, private
storage and CMS projects. They share the VPS kernel, disk, network and nginx;
resource limits reduce interference but do not provide two-server availability.

| Setting | Production | Staging |
| --- | --- | --- |
| Domain | prophotoacademy.com.ua | staging.prophotoacademy.com.ua |
| Linux account / service | prophotoacademy | prophotoacademy-staging |
| Loopback port | 3140 | 3141 |
| Release root | /srv/prophotoacademy | /srv/prophotoacademy-staging |
| Environment file | /etc/prophotoacademy/runtime.env | /etc/prophotoacademy-staging/runtime.env |
| Supabase project | bydmqmrbfjufsyhlayku | jxfyofiqhjmiguujrtdd (Ireland) |
| Sanity project | sfzp6094 | p0dn7nmp |
| Private learning dataset | learning | learning-staging |
| Payments | wayforpay | mock (no charge, no grants) |
| Application email / Make | Existing production services | No production keys or hooks |
| Search indexing | Public site | noindex header |

Runtime environment files are root-owned mode 0600. Staging cannot read
production files or secrets. Its service has a 75% CPU quota and 768 MB memory
ceiling. Both services start at boot. Staging has no email-dispatch timer.

Production active: aa6f6aa4630be415d02d120732e5df795da6b5dd.
Production rollback: 5e51620e28df954d79a7ea8651924b2dead58122.
Staging first active release: 5e51620e28df954d79a7ea8651924b2dead58122.
Staging has one release because this is its first deployment; retain the previous
verified staging release after the next deployment.

No production students, orders, progress or paid files were copied into staging.
Its seven schema migrations, restricted runtime role and private learning bucket
are initialized. Use synthetic development data.

## Remaining staging login configuration

Staging uses a fresh Supabase Auth project. Its Site URL is set correctly, but
its free default email provider does not permit editing the OTP email templates.
The application expects a code, while the provider's default template sends a
sign-in link. A separate staging SMTP provider and code templates are still
needed before ordinary email-code login/admin testing is ready. Do not copy
production SMTP/Resend credentials into the staging app or disable authentication.
No first staging administrator was created or pre-verified manually.

Production Auth Site URL and both signup/sign-in email templates now point to
the production domain; OTP placeholders and subjects were preserved. Saved
templates under supabase/templates match these corrections. The generator takes
an explicit origin argument; use https://prophotoacademy.com.ua for production.

## Staging deployment

Reviewed installed files:

- deploy/validate-staging.py -> /usr/local/lib/prophotoacademy/validate-staging.py
- deploy/build-staging.sh -> /usr/local/sbin/academy-build-staging
- deploy/activate-staging.sh -> /usr/local/sbin/academy-activate-staging
- deploy/prophotoacademy-staging.service -> /etc/systemd/system/prophotoacademy-staging.service

Upload a clean git archive to
/srv/prophotoacademy-staging/incoming/FULL_SHA.tar.gz, then:

    sudo academy-build-staging FULL_SHA
    sudo academy-activate-staging FULL_SHA

These commands never activate production. Build and activation are separate.
Builds use Webpack, a separate cache, a 1 CPU quota, 2200 MB RAM and 1536 MB
swap ceiling. The initial Turbopack build hit its lower memory limit; the bounded
Webpack build completed successfully. Completed/active releases cannot be
rebuilt; incomplete failed builds may be retried. Both environment builders
share /run/lock/academy-build.lock.

Activation checks health and rolls back on failure. The staging service runs
the environment guard before every startup. It rejects production database
references, privileged database users, TLS downgrades, live payments, production
notification hooks, booking bridge secrets and the production CMS project.

## Production deployment and integrations

The legacy academy-build command now refuses to run; an environment must be selected explicitly.

Production builds are explicit:

    sudo systemd-run --wait --pipe --collect -p CPUQuota=100% -p MemoryMax=2200M -p MemorySwapMax=1536M -p Nice=15 /usr/local/sbin/academy-build-production FULL_SHA /srv/prophotoacademy/incoming/FULL_SHA.tar.gz

Build from a committed, tested archive. The production command refuses to
overwrite an active/completed release. Verify a candidate on a spare loopback
port with the production environment before switching current and restarting
prophotoacademy.service. Keep the previous symlink and environment backup for
rollback. A source rollback also needs production public URLs baked into its
build; the retained pre-split build was originally compiled for staging.

No automatic deployment workflow exists in this Academy repository. A push does
not promote staging to production. Future CI must use separate scoped deployment
credentials and explicit production promotion, not the ubuntu administrative key.

Nginx's live template is deploy/nginx-environments.conf. The main domain proxies
to 3140; staging proxies to 3141; www redirects to the main domain. The exact old
staging /api/payments/wayforpay/callback still proxies to production for previously
issued payment requests. Signatures remain verified by production; staging has
no merchant secret. Newly issued production payments use the production callback.
Old staging return-page links are not a general proxy to production.

Booking remains on Hetzner 46.224.208.120. Its ACADEMY_ORIGIN is now
https://prophotoacademy.com.ua, so CRM and admin links use the production Academy.
Booking's privileges, cashbox and database were not migrated.

## Retention and verification

Use the installed guarded cleanup helper for the correct environment. Inspect
the plan before adding --apply:

    sudo python3 /usr/local/lib/prophotoacademy/prune-releases.py PREVIOUS_SHA --environment production
    sudo python3 /usr/local/lib/prophotoacademy/prune-releases.py PREVIOUS_SHA --environment staging

Keep the active and previous verified releases independently. Do not delete
curricula, databases, runtime files or user assets. The obsolete production
24d21f9 release was removed after verification.

Verified: both builds, architecture (470 modules), TypeScript, all 174 application
tests, and nine Linux deployment tests. The first CPU-limited test run had one
sandbox database initialization exceed its 5-second timeout; the full suite passed
with --maxWorkers=1 --testTimeout=15000 and unchanged assertions.

Live checks passed for both domains: home and database health, unauthenticated
admin API denial, own-origin requests accepted and cross-origin requests rejected.
A synthetic staging database write was absent from production and then removed.
Staging storage and CMS credentials verified against private staging resources;
staging OS access to production files/secrets is denied. Browser checks confirmed
each site's navigation remains on its own domain. www and booking return healthy
responses; staging has noindex and the production homepage does not.

## Academy identity deployment — 27 October 2026

Staging now runs `217001c331582e5c5c426a2c0e67bb43f08bc859`, built from its clean Git archive with the installed staging-only builder. It extends the homepage identity across public, conversion, student, lesson and administrative screens. The earlier card/title motion refinements are included. No schema, content, credentials, payment mode or service API changed.

The previous verified staging release is `92f3cc48bd8eaf7ba2eba440081fc87334cff38d`. After activation and smoke checks, the guarded cleanup command removed obsolete staging release `9d1f052fc57667bc00caed076d085236ee98b4cf`; exactly the active and rollback directories remain. Production still runs `aa6f6aa4630be415d02d120732e5df795da6b5dd` without a service restart. Booking and GitHub Pages were not deployed.

The Linux Webpack build, TypeScript and all 61 generated pages completed successfully. HTTPS checks passed for nine public/demo page routes, database health, two account/admin login redirects, two unauthenticated protected-read denials with no-store, and nine image/font/style assets. Staging keeps its noindex header and passes the configuration-isolation guard. Browser checks confirmed the new catalog, mobile package action before the photograph, demo lesson and editor toolbar. Evidence is retained locally under ignored `.data/academy-redesign/`. These checks did not create a user, submit an order, send email or modify learning progress.

For activation, capture and verify the current staging symlink first. The installed activation script can exit before its health-loop rollback if `systemctl restart` itself fails; this deployment therefore wrapped activation with explicit restoration of the captured release on any failure. Use the same protection until the helper handles that failure path internally. Cleanup must always specify `--environment staging`.

## Pricing and course hero deployment — 27 October 2026

Staging runs `3fab3eda61c76556c74f4f132f0569dc40a4f59d`, including the revised tier prices, highlighted GOLD, all nine course packages open for checkout, and the restored interactive PhotoStack in course heroes. Mock mode now exposes available course checkouts without requiring learning mappings and explicitly promises neither charges nor access. Instagram PLATINUM remains transparent about its undefined contents. No payment mode, entitlement mapping, database migration or remote CMS content was changed.

Verification passed: 243 tests, architecture, formatting, TypeScript, the local production build, 53-page synthetic export, and the isolated Linux build. All 41 live checks passed, including all nine checkout summaries, course prices, noindex, health, assets, login redirects and protected-read denials. The live slider advances correctly and its images load. Local browser checks cover five widths plus keyboard and pointer-swipe navigation. No order was submitted during live checks.

The captured rollback is `217001c331582e5c5c426a2c0e67bb43f08bc859`. Guarded cleanup removed obsolete `92f3cc48bd8eaf7ba2eba440081fc87334cff38d` and the superseded, never-activated `ce99c4673911d92fcac4df3d69f86127d4c39fcf` build. Exactly active and rollback remain. Production stays on `aa6f6aa4630be415d02d120732e5df795da6b5dd` with its existing process; booking and GitHub Pages were not deployed. Evidence is under ignored `.data/pricing-redesign/`.
