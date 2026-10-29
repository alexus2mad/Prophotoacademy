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
ceiling. Both services start at boot. Staging's invitation-only email retry worker
is documented in [invitation operations](INVITATIONS.md); other notifications stay isolated.

Production active: 5ae3eca80dbb9e8eb1bb1203343be16d99ba591a (29 October 2026).
Production rollback: aa6f6aa4630be415d02d120732e5df795da6b5dd.
Staging first active release: 5e51620e28df954d79a7ea8651924b2dead58122.
Staging has one release because this is its first deployment; retain the previous
verified staging release after the next deployment.

At initial setup, no production students, orders, progress or paid files were
copied into staging. Its seven schema migrations, restricted runtime role and
private learning bucket were initialized. The separately authorized content-only
copy on 28 October is recorded below. Continue using synthetic development data
unless an account or content operation is explicitly authorized.

## Staging email-code login — 28 October 2026

Staging Supabase Auth project `jxfyofiqhjmiguujrtdd` has custom SMTP enabled at
`smtp.resend.com:465`, with SMTP username `resend` and sender name
`ProPhoto Academy`. It uses a separately created staging Resend credential with
sending-only permission, restricted to `mail.prophotoacademy.com.ua`. The
credential is stored in Supabase SMTP configuration. The invitation feature also
uses staging's own sending credential in its root-protected runtime environment,
under invitation-specific variables. No credentials are stored in Git. Do not
reuse production credentials or disable authentication.

Email OTP settings are confirmed at eight digits and a 600-second expiry. The
staging signup and sign-in templates are stored separately in
`supabase/templates/staging/`; each includes `{{ .Token }}` and points its Academy
links to the staging origin. Both templates were applied to this staging project.
An actual request through the staging login form reached the code-entry screen,
and Resend confirmed the sign-in email as Delivered. The signup template was also
reloaded and compared with its saved source. Evidence is retained locally under
ignored `.data/staging-auth-fix/`. Delivery is verified; completing the sign-in
still requires the recipient to enter their code. No application release,
production configuration, account privileges or payment settings changed.

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

## Full-width course overview deployment — 28 October 2026

Staging now runs `edc309f4d714d58957ab07f8f453098302981a99`. Course pages no longer repeat the enrollment card beside the overview. Outcomes and audience share the full desktop width, followed by a wider curriculum; below 1024px these sections stack. The mobile enrollment control, pricing, package links and restored photo slider remain intact.

Verification passed: all 243 tests, architecture, TypeScript, formatting, local and isolated Linux Webpack production builds, and the validated 53-page synthetic review export. Local Turbopack could not start its CSS worker; the same Webpack compiler used by staging completed successfully. Responsive checks covered 360, 390, 768, 1024 and 1440px, with no horizontal overflow; native curriculum disclosures work by keyboard. All 41 HTTPS staging checks passed, and a live browser screenshot confirms the removed panel and full-width layout. No order was submitted.

Rollback is `3fab3eda61c76556c74f4f132f0569dc40a4f59d`. Guarded cleanup removed `217001c331582e5c5c426a2c0e67bb43f08bc859`, retaining exactly two staging releases. The isolation guard passed, staging remains in mock mode, and production retains both its previous release and process. Evidence is under ignored `.data/pricing-redesign/`; booking and GitHub Pages were not deployed.

## Editorial overview refinement — 28 October 2026

Staging was subsequently updated to `a1ca02eaccf075917e0cb053ece0072ccfa344ef`. The course overview follows a vertical reading path: unnumbered outcomes, a compact audience panel, then full-width curriculum disclosures. Spacing is 64px between sections on desktop and 48px on phones.

Verification passed: architecture, formatting, TypeScript, all 243 tests, local and isolated Linux production builds, the validated 53-page synthetic export, responsive and keyboard checks, independent visual review and 41 live HTTPS checks. The rollback is `edc309f4d714d58957ab07f8f453098302981a99`; guarded cleanup removed `3fab3eda61c76556c74f4f132f0569dc40a4f59d`. Production retained release `aa6f6aa4630be415d02d120732e5df795da6b5dd` and its existing process. Staging isolation passed; booking and GitHub Pages were not deployed.

This deployment note was recovered from the saved release record after local E: filesystem errors interrupted its original documentation commit. The application release itself had already been committed, deployed and verified.

## Content wrapper and course catalog deployment — 28 October 2026

Staging now runs `24cff8fe93d2436654f43ae505cee20198823a34`, including the shared 1472px Academy content limit, removal of catalog filters, and compact course rows with authored descriptions, prominent prices, exact start dates and one clear action. Past starts, archived events and bespoke schedules remain explicit. The source archive SHA-256 was verified before the isolated Linux build: `7744b8953c49aa124b42d1d12718ba41c5cd24b58c09bc5d1674c1710c80619f`.

Local verification passed architecture, formatting, TypeScript, 251 tests, the production build, the 53-page synthetic export and responsive checks from 360px to 2560px. The isolated Linux build passed compilation, TypeScript and generation of 61 pages. After guarded activation, all 53 live HTTPS checks passed: six course rows, actual dates, legacy-query behavior, the shared width token, all nine mock checkouts and prices, GOLD emphasis, health, login redirects, private-read denials, noindex and assets. Live browser checks confirmed the 1472px desktop cap and the first mobile course action within 390 × 844. Evidence is in ignored `.data/catalog-redesign/`.

Rollback is `a1ca02eaccf075917e0cb053ece0072ccfa344ef`. After inspecting the cleanup plan, the staging-only retention helper removed obsolete `edc309f4d714d58957ab07f8f453098302981a99`; exactly the active and rollback releases remain. Both services are active and staging isolation passes. Production remains on `aa6f6aa4630be415d02d120732e5df795da6b5dd` with its existing process (PID 57069). No runtime settings, database/CMS data, checkout submissions or learning progress were changed. Booking and GitHub Pages were not deployed.

## Favicon deployment — 28 October 2026

Staging runs `240d06349ae33ab28be599b658dddb51621d28b8`. Root metadata now advertises the original ProPhoto symbol as an SVG, a multi-size ICO and a 180px Apple bookmark icon; `/favicon.ico` also supports conventional browser requests. Explicit `/brand/` URLs work across public and workspace routes and the GitHub project path. The export validator now requires icon links and checks PNG/ICO file existence.

Verification passed architecture, TypeScript, formatting, both review-layout tests, the validated 53-page synthetic export and the isolated Linux production build. Live checks verified icon metadata on seven routes and all four asset URLs, MIME types and decoded raster sizes. Binary assets match local bytes; the SVG matches after normalizing archive-generated CRLF line endings. The existing 53 staging smoke checks passed, and a fresh browser tab received the new metadata. Evidence is under ignored `.data/favicon-fix/`.

The uploaded archive SHA-256 was `36d6668115d096b2bcfcbf5b25f08d18bd9b16b1fdb4f6fa0e585a4c80b90103`. Guarded activation preserved `24cff8fe93d2436654f43ae505cee20198823a34` for rollback. The inspected staging cleanup removed obsolete `a1ca02eaccf075917e0cb053ece0072ccfa344ef`, leaving exactly active and rollback. Production retains release `aa6f6aa4630be415d02d120732e5df795da6b5dd` and PID 57069. Both services remain active and staging isolation passes. No settings, data, purchases or learning progress changed; booking and GitHub Pages were not deployed.

## Invitations and original-color partner logos — 28 October 2026

Staging runs `d0cb23960a7952e40f5a87d2e44c9623f305da18`, including the original
Webflow partner logo colors, transactional access/administrator invitations,
delivery status and authorized resend controls, and mobile team rows. Existing
pending identities still require the recipient's own verified email login.

The dedicated invitation sender is configured in staging's root-protected runtime
file. It uses staging's own sending-only credential, never the production key.
General Resend/Make settings remain absent and payments remain mock. The isolated
`prophotoacademy-staging-email.timer` retries every five minutes; its first runs
succeeded. One explicitly authorized existing recipient was notified and Resend
confirmed Delivered. That recipient had independently completed OTP login before
the notice was sent; the resend preserved their verified identity and privileges.
No other historical invitations were bulk-sent, and no access was granted by the
release or verification scripts.

Verification passed architecture (512 modules), formatting, TypeScript, all 276
tests, local and Linux production builds, 11 Linux deployment tests, and the
validated 53-page synthetic review export. An initial parallel test run exceeded
the sandbox database initialization timeout; the complete suite passed serially
with its intended 15-second timeout and unchanged assertions. Desktop/mobile
checks confirmed the student and team invitation controls, accessible table
semantics, demo-safe actions, and all nine original-color logos. The 53 existing
HTTPS checks plus five invitation/logo checks passed. Textual SVG comparisons
normalize Git's Windows/Linux line endings; binary logo bytes match exactly.
Evidence remains in ignored `.data/staging-auth-fix/`.

The archive SHA-256 was
`ddf9142eed5dc155d40993c37dd96fc71d7da4fe4dcefdafa0e8ad1a0c949c79`.
Rollback remains `240d06349ae33ab28be599b658dddb51621d28b8`; the inspected retention
helper removed `24cff8fe93d2436654f43ae505cee20198823a34`. Exactly active and rollback
remain. Production retains release `aa6f6aa4630be415d02d120732e5df795da6b5dd` and PID
57069. Booking and GitHub Pages were not deployed. See [invitation operations](INVITATIONS.md)
before any future production rollout; production's sender must be configured
explicitly rather than changing its payment or notification modes.

## Production lesson copy and student access — 28 October 2026

The owner-authorized content-only copy populated staging's isolated PostgreSQL,
private Sanity dataset and private learning bucket. It copied three course
records and their editable drafts, the active Visual Content curriculum (version
6), its BASE package mapping, and all 274 ready teaching assets: 271 images and
three PDFs. The published curriculum retains Lectures 2–4 with 129, 93 and 111
blocks respectively, including their recordings and final quizzes. Instagram and
Content Day remain unpublished drafts. Unfinished draft lessons were not
published, and the existing difference between draft and published Lecture 3 was
preserved.

Course, lesson, release and media identifiers are unchanged. Every file was
downloaded from staging after upload and SHA-256 checked against its production
original (139,581,495 bytes in total). Drafts, release documents, manifests and
package mappings were compared after insertion. Production's content snapshot
was checked again before committing; it had not changed during the copy. Media
uploader references use the existing staging owner rather than importing
production identities.

No production accounts, invitations, enrollments, orders, transactions, progress,
attendance or notification jobs were copied. Counts of those staging records
were identical before and after the content operation. Private snapshots,
per-file hashes, before-state and completion reports remain root-only under
`/root/prophotoacademy-setup/staging-course-copy-20261028`; teaching payloads and
recipient details are excluded from Git and the synthetic review export.

After verification, the explicitly named, already verified staging recipient
received one administrative BASE grant covering all three published lectures,
using the existing three-month package duration, through 28 January 2027. This
independent student entitlement preserves their existing administrator role and
does not create a payment or import progress. The normal access service recorded
the audit entry and queued one access notice; the staging worker sent it and
Resend confirmed Delivered. Stable operation identifiers protect this grant from
duplication if verification is retried.

Deployed-service checks confirmed all three student lessons, hidden quiz answer
keys, the editable draft and 274-item media library. A different user was denied
lesson access. Sample image and PDF downloads succeeded through staging's signed
URLs; anonymous storage downloads and administrator media requests were denied.
These were service-level entitlement checks, not an impersonated browser login.
Local operational evidence is in ignored `.data/course-copy/`.

No application release or runtime setting changed. Staging retains
`d0cb23960a7952e40f5a87d2e44c9623f305da18` and its existing rollback; production
retains `aa6f6aa4630be415d02d120732e5df795da6b5dd` and PID 57069. Both services
remain active, payments remain mock on staging, and booking was untouched.

## Student workspace release — 28 October 2026

Staging received `9553e7910166e7f37eecf7e31e40a09637d6b64c`, with the shared student
dashboard, purchase history, settings and lesson chrome refresh. Architecture,
TypeScript, formatting, 280 tests, Windows and isolated Linux production builds,
and the validated 53-page synthetic export passed. Responsive review covered
360, 390, 768, 1024 and 1440px, plus keyboard navigation and the mobile drawer.
Native browser text enlargement could not be confirmed in the review tool.

All 53 existing HTTPS checks and nine student-area checks passed after activation;
live screenshots confirm the updated dashboard and curriculum. Anonymous private
routes still redirect to login. Evidence is in ignored `.data/student-area-redesign/`.
Release cleanup retained the active build and verified rollback
`d0cb23960a7952e40f5a87d2e44c9623f305da18`. No content, access, identity, payment
configuration or production release changed. The initial module-level collapse
is being corrected to lecture-level chapter disclosure at the owner's request.

## Lecture navigation and image preloading — 28 October 2026

Staging now runs `46d0865bc34a5a098f7626f9b710b0839efde19a`. Course groups and all
lecture titles stay visible. The current lecture is bold; its chapter anchors are
inside a native disclosure that starts closed and opens only through student
interaction. Inactive lectures remain direct links. Chapter navigation closes the
mobile drawer while preserving the user's explicit expansion during the lesson.

Image authorization now starts within three viewport heights in either scroll
direction, replacing the fixed 2,000px buffer. Pending observers adapt to resize;
admitted images download immediately and no longer observe scrolling. Private
media checks, URL lifetime and quiz-only progress are unchanged.

Architecture (517 modules), TypeScript, formatting, all 288 tests, Windows and
isolated Linux production builds, 11 deployment tests, and the validated 53-page
synthetic review export passed. The default highly parallel test run hit database
startup timeouts; the complete suite passed with two workers and no test-policy
changes. Local browser review covered 360, 390, 768, 1024 and 1440px without
horizontal overflow, keyboard expansion, chapter navigation and drawer behavior.

After activation, all 53 existing HTTPS checks and nine student checks passed.
Live browser review confirms visible lecture titles, closed initial chapters,
bold current-lecture text, keyboard opening and loaded photographs. Screenshots
and operational reports remain in ignored `.data/lecture-navigation-preload/`.
The application release directory contains only the active build and verified
rollback `9553e7910166e7f37eecf7e31e40a09637d6b64c`. Production remains on
`aa6f6aa4630be415d02d120732e5df795da6b5dd` with unchanged PID 57069. Both services
are healthy and staging isolation passes; no data or runtime settings changed.

## Selective student production release — 29 October 2026

Production now runs `5ae3eca80dbb9e8eb1bb1203343be16d99ba591a` from
`codex/student-production`. It starts from the preceding production release,
not staging HEAD: the student dashboard, purchase history, settings, lesson
presentation, collapsed lecture chapters and three-viewport image preloading
were promoted without unrelated public, administration, pricing or checkout
changes. Student styles are explicitly scoped; existing public/admin/login
selectors retain their original declarations and order outside that scope.
The separate UI commit is `1bf42c52c771632baee3d330485352dc7f081d5a`.

A separate security commit updates Next.js from 16.4.0 to 16.4.3, matching staging
and removing the affected version identified by the October Next.js advisories.
Other dependency versions and all authentication, payment, learning-domain,
content, API and database code remain unchanged. No migration or runtime setting
change was needed. Future deployment must still select the intended environment
and branch explicitly; this promotion does not make staging the production base.

Verification passed: architecture (478 modules), TypeScript, formatting, 194 tests,
Windows and isolated Linux production builds, and 53 validated synthetic review
pages. Browser checks covered 360, 390, 768, 1024 and 1440px without page overflow,
keyboard lecture expansion, mobile drawer dismissal after chapter navigation,
gallery zoom/navigation, and failed/successful quiz feedback. The shared demo
progress moved from 33% to 50% only after passing its third of six lessons.

Before activation, the built candidate passed 14 read-only route/authorization
checks and 41 static asset checks on a spare loopback port. Those checks passed
again through production HTTPS after activation. Live browser review confirmed
the shared student screens and lecture disclosure. The browser had no signed-in
production student session; protected pages correctly redirected to login, and
private API reads returned 401 with no-store responses. No real account, purchase,
quiz completion or private teaching content was changed for these checks.

Atomic activation verified the production process's release directory and database
health. Runtime files, Nginx configuration, service definitions and staging's
release/process fingerprint were identical before and after activation. Cleanup
removed only obsolete production `5e51620e28df954d79a7ea8651924b2dead58122`, retaining
the active release and `aa6f6aa4630be415d02d120732e5df795da6b5dd` for rollback.
Staging remains on `46d0865bc34a5a098f7626f9b710b0839efde19a` and is healthy.
Private screenshots and operational scripts are under ignored
`.data/production-student-mail/`.

## Inbound mail forwarding — 29 October 2026

With explicit owner confirmation, Imena catch-all forwarding was saved for the
apex domain. Unknown addresses route to `info`, which forwards to both
owner-approved Gmail destinations. Both destination rows and the default alias
were reopened and confirmed after saving. Public apex MX now resolves to
`mx.imena.ua`; the Resend sending-subdomain MX remains unchanged. Recipient
addresses and screenshots remain outside Git. Inbox delivery has not been
confirmed by the recipients; no test message was sent.
