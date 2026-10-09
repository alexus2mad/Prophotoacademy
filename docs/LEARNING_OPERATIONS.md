# Learning platform activation and operations

## Ownership

Academy: verified email login, student dashboard, personal purchases/profile, lessons, content authoring and protected media. ps-booking: student accounts, access administration, administrator privileges, student statistics, attendance and the existing cashbox. There is one authoritative identity/access/progress store in Academy PostgreSQL and one management UI in booking. Do not enable legacy shared browser tokens.

## Configure before activation

1. Deploy Academy as a full Next.js application on Vercel with the production Academy origin. GitHub Pages is a synthetic review and cannot authenticate students or process purchases
2. Configure Supabase URL, publishable key, service-role key and a PostgreSQL connection. Use TLS and the transaction pooler for serverless requests. Keep the `academy` schema out of exposed Data API schemas; all its tables have RLS with no anonymous/authenticated policies
3. Run `pnpm db:migrate`. Back up the legacy SQLite ledger, run `pnpm db:import-legacy --file=<private-path>` as a dry run, inspect counts, then add `--write`. The importer is repeatable and reconciles source IDs. It preserves historical orders but does not invent entitlements for unmapped old purchases
4. Configure Supabase email OTP templates to contain the token, disable unrelated sign-in providers, and configure Resend SMTP with a verified sender/domain. Test actual delivery and rate limits. `alex.maksiutenko@gmail.com` bootstraps once, only after verified email ownership. Delegated privileges and pending invitations are managed in booking
5. Create a **private** Sanity dataset named `learning`, separate from the public marketing dataset. Install `sanity/learningSchema` in a separate private Studio if needed. Give the server token access to that dataset and permission to inspect its ACL. The service refuses a public dataset. Draft edits use revision comparisons; publishing atomically compares the saved revision and writes an immutable release
6. Create a **private** Supabase Storage bucket `learning`, maximum file size 50 MB, restricted to PDF/JPEG/PNG/WebP. Do not grant anonymous or ordinary-user object access. The service verifies that the bucket is private before uploads/download signing. No paid assets belong in Sanity's ordinary public asset store
7. Configure Mux API credentials and signing key/private key. Connect signed asset webhooks to `/api/media/mux`, with `MUX_WEBHOOK_SECRET`. Uploads create signed playback assets. Test processing errors, retries, playback, captions and expired credentials with real course media
8. Configure Resend API delivery, `EMAIL_FROM` and `CRON_SECRET`. The platform cron delivers the transactional outbox; provider failures leave fulfillment intact and retry later. SMTP authentication delivery is configured separately in Supabase
9. Apply booking migration 017. Set booking `ACADEMY_ORIGIN` to the Academy server origin and use the same random secret for booking `ACADEMY_MANAGEMENT_SECRET` and Academy `PS_BOOKING_MANAGEMENT_SECRET`. Set Academy `NEXT_PUBLIC_MANAGEMENT_URL` to booking `/academy.html`. Rotate both sides together; old booking sessions become unusable and require login
10. Review teaching content, package-to-lesson mappings, access months and intake dates before opening checkout. Instagram BASE promises five months; lifetime packages must remain lifetime. The editor checks known published duration promises. Seeded public outlines are drafts, not supplied teaching material
11. Keep the existing WayForPay checkout/callback addresses and configure verified merchant credentials. Approved callbacks fulfill known orders exactly once. Browser redirects and mock payments never grant access. Confirm full/partial refunds and failed/duplicate callbacks in a provider sandbox before taking real payments

## Learning and progress

Required blocks determine completion, weighted by expected study time. Video uses unique 90% coverage, articles 90% coverage plus 80% active reading time, images five seconds by default and PDFs 90% pages with page reading time. Supplementary blocks do not lower completion. Opening/downloading a file is not completion. These are product heuristics, not proof of attention or comprehension.

Progress requests have unique IDs, session sequences and bounded observed-time intervals. The server merges overlapping study intervals so concurrent tabs and retries cannot multiply time; interrupted-session events can be replayed for up to 48 hours. Older/offline study can use explicit student confirmation, with its source preserved. Manual confirmation is tied to the required block revisions. Changed media resets the affected block; unchanged material retains progress. Confirmed Zoom attendance or recorded-video coverage completes Zoom, never link opening. No lesson automatically navigates to the next.

Zoom schedules use `Europe/Kyiv`, reject spring DST gaps, and explicitly resolve repeated autumn times. Students see a labelled local timezone. Rosters live in booking; canceled or unfinished sessions cannot receive attendance. A recording must be a ready video owned by that course.

Temporary URLs expire, but a valid URL can work until its expiry after access revocation. Already downloaded material cannot be revoked. Reopen a lesson to refresh expired links. PDF page estimates are calculated during the authenticated author upload and can be adjusted; review image-only PDFs and very long pages before publishing.

## Operations and release checks

- Monitor unpaid/uncertain orders, callback failures, pending outbox retries, failed media and old processing uploads. Alerting infrastructure needs to be connected in the production host
- Inspect cashbox synchronization and refunds in ps-booking. The management bridge does not deliver payment reconciliation events. Recovery of missed callbacks/refunds from booking remains a release integration item, as documented in `PS_BOOKING_BOUNDARY.md`
- Access revocation preserves learning history and does not refund money. A full confirmed refund revokes only the grant from that purchase. A separate valid admin grant remains valid
- Test two verified administrators, a pending invitation, expired verification, immediate role revocation and last-admin protection. A booking manager cookie alone must never authorize Academy data
- Test a guest purchase followed by login, wrong-user reads, package restrictions, scheduled lessons, revoked/expired access and media downloads
- Run architecture checks, TypeScript, tests, production build, Pages build and Pages validation. Review desktop/mobile journeys and keyboard dialogs. Synthetic review fixtures are not migration input

No live service accounts, real lesson content, merchant configuration or production deployment are provisioned by this implementation. The release gate stays closed until these checks are performed with the configured services.
