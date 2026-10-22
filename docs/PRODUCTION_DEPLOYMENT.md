# Academy production deployment

> Current topology and deployment commands: [Staging and production isolation](STAGING_ISOLATION.md). The historical provisioning notes below predate the OVH migration and domain split.


The selected host is the existing Hetzner server at `46.224.208.120`, SSH port `58222`. The owner approved this change from Vercel on 11 October 2026. Academy runs as a separate service and OS account, alongside ps-booking. Its initial origin is `https://staging.prophotoacademy.com.ua`; the existing public marketing domain is not cut over by this setup.

The owner explicitly requested a staging subdomain while the existing Webflow site stays operational. Keep the apex and `www` DNS records and existing mail routing unchanged. The staging HTTPS host sends `X-Robots-Tag: noindex, nofollow, noarchive` on every response. Payment-disabled test enrollment was activated on 12 October 2026; real WayForPay charging remains inactive.

## Services and configuration

- Application: `prophotoacademy.service`, loopback port `3140`, OS account `prophotoacademy`
- Releases: `/srv/prophotoacademy/releases/<commit>`; `/srv/prophotoacademy/current` selects the active release
- Runtime configuration: `/etc/prophotoacademy/runtime.env`, root-owned mode `600`; use `deploy/runtime.env.example` for variable names
- TLS trust: `/etc/prophotoacademy/supabase-ca.crt`; PostgreSQL uses `sslmode=verify-full`
- Runtime database transport: Supabase's IPv4 **session pooler**, `aws-0-eu-north-1.pooler.supabase.com:5432`, user `prophoto_academy_runtime.bydmqmrbfjufsyhlayku`; the underlying database role remains `prophoto_academy_runtime`
- Nginx templates: `deploy/nginx-http.conf` for ACME setup, then `deploy/nginx-https.conf`
- Email retries: `prophotoacademy-email.timer` calls the existing authenticated cron route every five minutes through loopback
- Booking integration: booking `ACADEMY_ORIGIN` points to the Academy HTTPS origin; its `ACADEMY_MANAGEMENT_SECRET` must equal Academy `PS_BOOKING_MANAGEMENT_SECRET`

Keep runtime files, database credentials, provider tokens and private learner data outside Git. Do not copy the local sandbox or `.data` into a release. Use a Git archive of the tested commit; install the lockfile with pnpm, run the build as the application account, and retain the previous release for rollback. Do not build Linux production dependencies on Windows.

### Release retention

After **every successful application deployment**, retain exactly the active release and the immediately preceding verified release. Capture the old `current` target before activation; use that full Git SHA as the rollback argument, rather than guessing from directory dates. Finish activation, health checks and the affected browser smoke checks before pruning. Do not build or activate another release concurrently with cleanup.

Run the following on the Academy host, substituting the captured SHA. The first command prints the exact absolute targets without deleting anything; inspect it before applying:

```sh
python3 /srv/prophotoacademy/current/deploy/prune-releases.py PREVIOUS_FULL_SHA
python3 /srv/prophotoacademy/current/deploy/prune-releases.py PREVIOUS_FULL_SHA --apply
```

The helper verifies both retained builds, confines deletion to direct full-SHA directories under `/srv/prophotoacademy/releases`, rejects symlinks and mounts, checks application health, and stops if the active release changes. A failed deployment keeps the existing rollback options. If cleanup itself fails, keep the healthy deployment active, report the failure and rerun cleanup after resolving it. Verify the directory listing afterward. Unknown directory names are left untouched for inspection.

This retention policy applies only to application build directories. Preserve immutable learning curriculum versions, private source archives, teaching assets, student progress, database backups and runtime configuration. Booking's releases remain under its separate deployment process.

Run `python -m unittest discover -s deploy -p "test_*.py"` when changing cleanup behavior.

Supply `NODE_EXTRA_CA_CERTS` in the process environment before Node starts, as the systemd unit does. For a manual Node command, export it explicitly before invoking Node; loading that variable only through Node's `--env-file` is too late for extra CA initialization. Keep full TLS verification enabled.

### Database network recovery — 13 October 2026

The signed-in account page failed while the application process remained active. `/api/health` returned 503 and PostgreSQL connections failed with `ENETUNREACH`. The host had a valid IPv6 address and default route, and its link-local gateway was reachable, but the provider's upstream router returned “Destination unreachable: No route” for both Supabase and an independent external IPv6 address.

Recovery changed only `DATABASE_URL` in the root-owned runtime configuration to the project's official IPv4 session-pooler endpoint. Supabase's Connect dialog supplies the exact host; custom roles use `ROLE.PROJECT` as the connection username. Keep port 5432/session mode for this persistent server, the existing restricted database password, and `sslmode=verify-full`. Do not guess a regional endpoint, switch to the `postgres` owner, weaken certificate checks, or modify host-wide IPv6/firewall settings. See [Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres).

Before applying the change, a read-only transaction verified schema access, the underlying runtime role, and an encrypted, authorized client TLS socket. `pg_stat_ssl` behind a pooler describes the pooler's database connection, not the application's TLS socket. The original environment was preserved in a root-only `runtime.env.before-ipv4-*` backup; only Academy's service was restarted. Reverting an application build must retain this working runtime endpoint. Restore a direct endpoint only after its network path is verified healthy.

Public health recovered to 200, and the existing signed-in account resumed without another code, displaying its existing course access and 1/3 (33%) completion. This was a runtime configuration repair, with no source-code deployment or curriculum change. The two retained application releases remain `de8d58e` (active) and `aa9eeea` (rollback).

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

### Enrollment activation — 12 October 2026

Academy release `e26abbb` is active with explicit `PAYMENT_MODE=disabled`, following migration `202610120001`. Test enrollments create genuine grants with a zero order amount, a distinct test source and no provider financial record. The previous application release is `a081499669ad05307bcef5b9337a3f0f44e01195`; the original runtime environment is retained in a root-only `runtime.env.before-enrollment-*` backup. See `COURSE_CHECKOUT.md` for the manager workflow and real payment activation.

The signed-in browser exposed nginx's response-header buffer limit during Supabase cookie refresh. The Academy HTTPS host now uses `proxy_buffer_size 16k` and `proxy_buffers 8 16k`, preserving streaming and private/no-store responses. `nginx -t` and an authenticated settings-page reload passed; the original virtual host is saved as `prophotoacademy.before-enrollment-header-fix`. This change does not alter other hosts or authentication policy.

The ps-booking label change deployed successfully as `8b73ffe` / `1.11.005`. Academy's 88 tests, architecture checks, TypeScript, production builds and 49-page review validation passed. ps-booking's 436 tests and syntax checks passed. Local browser checks covered checkout → zero-charge enrollment → email login → account/history, with overflow and touch-target checks at 360/390/768/1024/1440px. The management bridge confirmed the same synthetic grant and zero-charge order. Screenshots are saved locally under `.data/enrollment-qa` and contain no production customer records.

Public health, anonymous admin denial, management signature/session checks and nonce replay checks passed after activation. Mock and WayForPay callback endpoints both return 404 in disabled mode. The signed-in settings page confirms the configured enrollment mode. At activation, the only staging course, “Інста, яка продає”, is still unpublished and has no package rules: its checkout correctly remains unavailable until teaching material is published and its package is configured. No teaching content, customer grants or orders were fabricated on staging.

Run architecture checks, TypeScript, relevant tests, production build and the static review export before release. `/api/health` verifies database connectivity and the management migration; it returns no configuration or customer data and is not cached. This health check does not certify SMTP delivery, payment readiness, or media-provider configuration.

After deployment, verify the health endpoint, login, management bridge, course authoring, private media authorization and an actual administrator email-code login. Enable the email timer only after sender configuration is verified. Keep payments disabled until the separate payment release checks pass. Mux video upload/playback also requires its own credentials before video lessons can be published.

Rollback switches `current` to the prior verified release and restarts `prophotoacademy.service`. Database migrations are not rolled back automatically. Booking's service, schema, payment configuration and release directory remain independent.

## Lesson authoring update — 12 October 2026

The shared lesson renderer supports paired uncropped photographs, a collapsible section outline, a practical-exercise treatment and editable quizzes. The source lecture was adapted into a private draft for the visual-content program, with 20 blocks, ten selected visual examples, one optimized 104-page PDF and six self-check questions. The rest of that course remains draft outlines; no incomplete curriculum or package mapping was published. Teaching files and the authored payload are held outside Git in private Storage/Sanity and ignored operational files.

Verification covered 96 automated tests, eight local quiz/access integration checks, private download redirects, student progress persistence, administrator preview and all five responsive widths (360, 390, 768, 1024 and 1440). Source changes are `cce45cf` (lesson composition and quiz authoring/grading) and `babb9b7` (fresh private downloads). See `LESSON_AUTHORING.md` for maintenance policies.

Staging runs `babb9b772ff19454ceb47da23c983a547f7f0d33`. The preceding feature release is `cce45cfe4a83209ca430963a88672d79829321fd`; the pre-feature release remains `e26abbbb3abce9da71f4b791307754c14c2924a9`. Activation preserved `PAYMENT_MODE=disabled`, nginx and the email timer. No database migration was required for the quiz JSON state. The private lesson is available through the authenticated course editor preview; no grants, purchases or emails were created on staging by this import.

## Lesson typography update — 12 October 2026

Staging now runs `f7d43760a2b48e59282ac98e88df9ac411a5975e`; rollback target is `babb9b772ff19454ceb47da23c983a547f7f0d33`. The scoped Source Sans 3 reading system covers lesson headings, prose, lists, captions, practice and quizzes. The student player and editor share semantic Markdown rendering, normalized heading levels and keyboard-scrollable tables. No content migration or republication was needed.

Verification: 100 tests, architecture, TypeScript, formatting, local and Linux production builds, and 49 validated review pages. Browser checks covered 360/390/768/1024/1440px, nested lists, Ukrainian italics, long links, keyboard table scrolling and a local specimen with 200% enlargement plus text-spacing overrides. The signed-in staging preview confirms 18px text, 30.6px line height, 22px subheadings and 672px maximum reading width. Public health returns 200; anonymous course API access returns 401. Payment mode remains disabled. Source lessons, private assets and course access were not changed.

## Visual-content enrollment activation — 12 October 2026

Staging runs `3f9035b7cf0c11519b97a42dd5727a2df54bda03`, with `f7d43760a2b48e59282ac98e88df9ac411a5975e` available for application rollback. Managers can now choose lessons for publication while retaining other outlines in the authoring draft. Selected lessons retain the existing media, quiz, revision and required-material validation. Test checkout and package cards expose only the titles of included lessons from the assigned release.

Through the signed-in course editor, version 1 of the visual-content course was published with only “Композиція та світло”. All twelve draft lessons remain in the editor. The existing `visual-base` package for `offering-visual-2026-03` is mapped to this release and lesson, with three months of access and no deferred start. This is the sole enabled package; no historical intake date was presented as a new cohort. `PAYMENT_MODE=disabled` grants zero-charge test access. Ordinary paid-mode availability checks still apply if payment configuration changes.

Verification includes 104 tests, architecture, TypeScript, formatting, production builds on Windows and Linux, and 49 validated review pages. The local persisted sandbox exercised selective publication, draft preservation, package mapping, checkout, exact retry idempotency, dashboard access and the student lesson using synthetic accounts without outbound email. Mobile publishing and checkout were inspected. Read-only staging checks confirm the single-lesson release, three-month mapping, disabled payment mode, health 200 and anonymous PDF denial (401). Live checkout was inspected without submitting a customer order. No student grant or financial transaction was fabricated on staging.

### Persistent login rollout — 13 October 2026

Academy `453ea839035ac832f55d4d126f7b4c00485d25f2` is active; rollback is `3f9035b7cf0c11519b97a42dd5727a2df54bda03`. It renews device cookies before authenticated API requests as well as account pages and checkout, preserves cookie chunks and no-cache headers, skips redundant login forms for valid sessions, and scopes logout to the current device. Supabase's one-hour JWT expiry and refresh-token protection remain unchanged. The server session lifetime settings were already unlimited; the missing API refresh path was the application defect.

Booking `7e8370eb89b6587cf9f30ecdbbbcb6c38766d93e` (`1.11.006`) deployed after Academy through its existing workflow. Academy management sessions now use a rolling 90-day inactivity window on both sides of the bridge. Renewal does not change recent-verification timestamps or restore expired sessions. Studio/cashbox authentication remains independent.

Verification passed: Academy 124 tests, architecture, TypeScript, formatting, Windows and Linux production builds, and 49 validated GitHub review pages; booking 436 tests and its required code checks. Real Supabase SSR-client tests cover expired-token renewal, cookie chunk deletion, subsequent device requests, local logout and revoked refresh tokens. Database/API tests cover management renewal, expiry, role revocation and unchanged fresh-verification requirements. Live browser checks resumed the owner's existing Academy session from login links into course administration, the account and mobile settings without an OTP. Booking's browser was signed out, so its authenticated renewal is covered by integration tests rather than a new live OTP login. Both health endpoints return success; anonymous admin and protected-media reads return 401. Payment-disabled enrollment remains configured.

### Lecture recording and progress repair — 13 October 2026

Academy `86fca53291899be750d5d24b0ee9c964aa1d0384` is active; the preceding application release is `453ea839035ac832f55d4d126f7b4c00485d25f2`. Short reading visits now retain their observation timestamps, completed reading blocks no longer monopolize inspection time, and dashboard metadata retains the media identity needed to calculate progress. Quiz review distinguishes correct/incorrect options using colors, icons and explicit labels, including previously submitted attempts. The completion footer explains unfinished requirements and makes explicit reading confirmation discoverable. Historical missing observations are not fabricated.

The visual-content curriculum was explicitly published as version 2 with the requested Lecture 2 title and a supplementary YouTube recording. Required block IDs, revisions, quiz data and completion weights are unchanged. The existing BASE mapping and the owner's single existing grant moved to version 2 through audited services, preserving the access period, purchase association and saved progress. Other course outlines remain drafts. Root-only draft/access backups and the publication checkpoint are retained under `/root/prophotoacademy-setup`. An application rollback that predates YouTube support also requires reverting that package mapping and grant to the retained preceding curriculum version; do not delete either release or student progress.

Verification: 137 tests, architecture, TypeScript, formatting, production builds and 49 validated review pages. Synthetic manager/student browser checks covered saved authoring, quiz feedback on desktop/mobile and manual completion persisting to the dashboard. Live checks confirmed the existing login, Lecture 2 in curriculum and summary, previously saved quiz feedback, actual YouTube playback, and responsive layouts at 360/390/768/1024/1440px without horizontal overflow. Screenshots are retained locally under `.data/photo-lesson`. Health returns 200; anonymous admin and private-PDF requests return 401 with private/no-store responses. Payment mode remains disabled; ps-booking was not changed or deployed in this release.

### Lecture 3 publication — 13 October 2026

The visual-content course now publishes curriculum version 3 (`e9d39739-4d51-4d5c-97c5-28456db77485`) with Lectures 2 and 3. The new lesson uses stable ID `light-and-lighting` and explicit number 3. Its 22 blocks include the supplied supplementary YouTube recording, illustrated reading, a practical exercise, an optional presentation download and an eight-question formative quiz. Eight instructional images and the 78-page PDF are stored privately; the optimized PDF is 14,586,001 bytes and preserves every page and all extracted text. Source files, authored prose, answer keys, upload checkpoints and screenshots remain outside Git under ignored `.data/photo-lesson-3` and root-only `/root/prophotoacademy-setup/lecture-3`.

The BASE package includes both published lectures. The owner's existing test grant was upgraded through the audited access service, retaining its purchase association, access dates and revocation state. Lecture 2's content, block revisions and saved progress are unchanged. Overall course progress now averages two lessons; a lower aggregate percentage after adding the new lesson is expected. All twelve preceding draft outlines/material sets remain intact. No purchase, payment or student completion was generated by publication.

Verification passed: architecture checks, TypeScript and 27 relevant learning, quiz and numbering tests. Publication checks confirmed valid media, correct quiz grading, hidden answer keys in student payloads, unchanged prior lesson data and navigation from Lecture 2 to Lecture 3. Live browser checks covered administrator quiz feedback, student access, actual recording playback and 360/390/768/1024/1440px without horizontal overflow or failed instructional images. The downloaded private PDF matches the uploaded file's SHA-256 hash. Anonymous media access returns 401 with no-store headers, public Storage access is denied, and health returns 200.

This was a content publication, with no application rebuild or GitHub Pages export required. Academy remains on `86fca53291899be750d5d24b0ee9c964aa1d0384`; `PAYMENT_MODE=disabled` and ps-booking are unchanged. For content rollback, retain version 3 and its progress records, then explicitly restore the BASE mapping and affected grant to the backed-up version 2 release (`5bd7b800-fd36-44e5-a3a4-c53e2450dcd2`). Use the saved draft and access backups as review material; do not delete either immutable release.

### Lecture 4 publication — 13 October 2026

The visual-content course now publishes curriculum version 4 (`3ee8ce56-0274-46f5-9497-56e0fa2ea801`) with Lectures 2, 3 and 4. The new lesson uses stable ID `color-theory` and explicit number 4. Its 27 blocks include the supplied supplementary recording, illustrated reading, a two-palette practical exercise, the full presentation and an eight-question formative quiz. Twelve instructional images and the 93-page PDF are ready in private Storage. Color diagrams and perception examples use lossless PNG; the optimized PDF is 19,508,951 bytes and preserves every page and all extracted text. The original source is unchanged. Teaching content, quiz keys, assets, screenshots and operational checkpoints remain outside Git in ignored `.data/photo-lesson-4` and root-only `/root/prophotoacademy-setup/lecture-4`.

All thirteen preceding draft lessons/outlines remain unchanged. Administrator preview verifies the lecture title, numbered summary, images, semantic tables, exercise and correct/incorrect quiz explanations without writing student progress. Checks at 360/390/768/1024/1440px show no page overflow or failed instructional images. Architecture, TypeScript and 27 relevant tests pass. A downloaded private PDF matches the uploaded file's SHA-256 hash; anonymous media requests return 401 with no-store headers, public Storage reads are denied, and health returns 200.

The BASE package now includes all three published lectures. With explicit publication/access approval, the owner's existing test grant was upgraded through the audited access service, preserving its purchase association, source, access dates and revocation state. Earlier published lessons and saved progress were verified unchanged. Overall course progress now averages three lessons; adding Lecture 4 changes the denominator. Student access and navigation from Lecture 3 to Lecture 4 are verified live, quiz answer keys remain excluded from student payloads, and screenshots are saved locally. No purchase, payment or student completion was generated by publication.

This was a content publication without an application rebuild or GitHub Pages export. Academy remains on `86fca53291899be750d5d24b0ee9c964aa1d0384`; `PAYMENT_MODE=disabled` and ps-booking are unchanged. For content rollback, retain version 4 and its progress records, then explicitly restore the BASE mapping and affected grant to the backed-up version 3 release (`e9d39739-4d51-4d5c-97c5-28456db77485`). Use the saved draft and access backups as review material; do not delete either immutable release.

### Lesson photo viewer — 13 October 2026

Academy `aca61f80cea8d323f14869e9c3e3bf444de424af` is active; rollback release is `86fca53291899be750d5d24b0ee9c964aa1d0384`. Student lessons and saved-draft previews now open image blocks in a native modal gallery, with captions, previous/next controls, keyboard navigation, zoom/reset, bounded dragging and touch gestures. The viewer obtains fresh authorized media URLs and isolates reading observation to the open photo. Curriculum versions, grants and payment configuration were not changed.

Verification covers architecture (411 modules), TypeScript, formatting, 143 tests, production builds and 49 validated static review pages. An unrelated sandbox timing test timed out on a repeat parallel run and passed when rerun with the relevant viewer/reading tests. Browser checks verified desktop zoom, double-click, dragging/swipe, keyboard pan/navigation, Escape/focus restoration, administrator preview, and 360/390/768/1024/1440px without horizontal overflow or undersized controls. Live checks confirmed the ten protected Lecture 2 photos, zoom, navigation, mobile layout, health 200 and anonymous private-media denial (401, private/no-store). Screenshots are retained under ignored `.data/lesson-image-viewer`. GitHub Pages publication completed successfully from the same source commit; it contains synthetic examples only.

### Course authoring redesign — 13 October 2026

Academy `bfa2f2d5242c9f9b06b6663a284f0b133e75b2d6` is active; rollback release is `aca61f80cea8d323f14869e9c3e3bf444de424af`. The course editor now separates Materials, Access and Meetings, with a course outline and one focused material form. Protected photographs, recordings and PDF pages render in the editor; text has a formatted preview. Mobile outline selection restores keyboard focus and the visible lesson position. Save/upload locking, exit warnings, replacement failure handling and functional draft updates protect in-progress edits.

Verification passed: 422-module architecture check, TypeScript, formatting, 146 tests, Windows/Linux production builds and 49 validated review pages. The persisted synthetic sandbox exercised lesson creation, article formatting, image/PDF upload, immediate preview, PDF paging, saving and reload persistence. Shared demo checks covered quiz editing and keyboard navigation. Live read-only checks verified the real Lecture 2 image, YouTube recording and 104-page protected PDF. All five viewport widths (360, 390, 768, 1024, 1440px) showed no page overflow or buttons below 44px. Health returned 200 and anonymous administrator-media access returned 401 with private/no-store headers. Screenshots are under ignored `.data/editor-redesign`; GitHub Pages deployment succeeded.

No real draft, published curriculum, enrollment or payment configuration changed. Payment mode remains disabled. Mux credentials are still absent, so direct production video uploads await video-service setup; existing YouTube recordings work. Native video preview was exercised through the isolated sandbox adapter.
