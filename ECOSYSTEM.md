# ProPhoto ecosystem

Academy and Hub are distinct public sites using one Next.js codebase, design system and Sanity dataset. Academy remains led by Інста, яка продає. Hub leads with spaces, first-screen hourly rates and the existing booking calendar. Local review: `/` and `/hub`.

## Domains and content

Build with `NEXT_PUBLIC_ACADEMY_URL=https://www.prophotoacademy.com.ua`, `NEXT_PUBLIC_HUB_URL=https://www.prophotohub.com.ua`, `NEXT_PUBLIC_SITE_URL=https://www.prophotoacademy.com.ua`, and `PROPHOTO_SITE=auto`. Set these public variables **before** building. Attach both domains to the same persistent Node deployment. The proxy rewrites Hub pages to internal `/hub` routes, preserving public slugs, room queries and independent sitemap/robots responses. Academy `/hub` requests redirect to the Hub domain to avoid duplicate URLs.

Separate deployments can use `PROPHOTO_SITE=academy` or `hub`, with the same public URLs and shared durable database. SQLite requires a common persistent Node host/volume. Separate machines require a database adapter or private shared operations service; copying separate SQLite files does not create shared history.

Hub public routes: `/`, `/mainhall`, `/smallhall`, `/makeuproom`, `/booking?room=…`, `/contact`, `/about`, `/content-practice`. Local preview prepends `/hub`. `/studio` remains the authenticated Sanity Studio. Checkout and booking navigation omit competing offers.

The reviewed migration now contains **63 documents and 19 photographs**. New Sanity types: `studioRoom`, `hubSettings`, `practiceSession`. Hub contacts, location, arrival instructions and calendar are separate from Academy settings. Public Hub rates, imagery and logo were captured on 7 October 2026; provenance is in `content/source/hub-provenance.json`. Original watermarks and renovation notices remain. Testimonials are not reassigned.

`pnpm content:migrate` is a local dry run. `--write` preserves existing documents. Import the new content before switching to Sanity mode; edit `hub-settings` for Hub and `site-settings` for Academy. No cloud writes or deployment were performed.

## Guided practice

Контент-практика в ProPhoto Hub starts in `planning`, related to Інста, яка продає, with inquiries only. Opening registration requires explicit verification, date, duration, capacity, price, equipment, preparation and deliverables. Missing personnel, dates and prices are not invented. Paused sessions are removed from promotion. Offline practice is optional; visitors outside Kyiv have a direct online-learning alternative.

For paid registration, create a dedicated class program and verified intake, then link the session's `enrollmentOffering`. Its program title, date and starting price must match the session. Checkout continues to validate availability and calculate prices on the server. Do not link an unrelated course intake.

## Customer operations

`/operations` is the private team view. Set server-only `OPERATIONS_TOKEN` to at least 32 characters. The password field sends it in an Authorization header; it is not stored in URLs or browser storage. `GET /api/operations/customers` requires it and uses `Cache-Control: no-store`. Access remains disabled when the secret is missing. The page is excluded from indexing.

Inquiries retain selected product/package, site, campaign context, locality where appropriate, consent time and a separate optional announcements preference. Required inquiry consent does not imply a subscription. Approved real orders provide course purchase records; mock payments are excluded from real metrics.

Import confirmed booking and attendance records through `POST /api/ecosystem/activity`, authenticated with a distinct server-only `ECOSYSTEM_INGEST_TOKEN`. Use a trusted provider adapter or `pnpm activity:import <private-json-file>` against the configured site. Neither sends promotional messages. Keep import files and customer data in private storage.

Activity fields: stable entity `id`; `source` (`plainstack`, `academy`, `operations`); `kind` (`course-enrollment`, `course-completed`, `practice-purchased`, `practice-completed`, `studio-booking`); ISO UTC `occurredAt` and monotonic `updatedAt`; `status` (`completed`, `canceled`, `refunded`); `customer` with name and email and/or phone. Supply the corresponding known `programId`, `practiceSessionId` or `roomId`. Optional: `locality`, integer UAH `revenue`/`cost`, and `acquisition`. Reuse the real order ID when importing an existing Academy order. Retries are idempotent; stale updates cannot revive cancellations.

Room mappings: `room-cyclorama` → `tsyklorama`; `room-podcast` → `podcast`; `room-makeup` → `grymerna`. Practice ID: `practice-content-hub`. Reservations stay with `https://booking.plainstack.net/embed`. Calendar visits, clicks and arbitrary postMessages never count as bookings. A trusted authenticated feed/export must provide confirmed records; it has not been supplied or live-verified.

The view merges normalized contacts, shows product history and preferences, and recommends one next action: eligible local graduates → guided practice; completed practice → the same room; remote visitors → online learning. It sends no automatic promotions. Metrics count confirmed enrollments, bookings, practice purchases, repeat studio customers and studio use after practice. Revenue covers completed transactions; contribution margin requires costs for every paid record. Conversion denominators come from analytics.

## Attribution and rollout

Campaign source, medium and campaign follow cross-site links together with `from_site`. Acquisition remains in page memory during a visit; email addresses, order tokens, arbitrary query data and full referrer URLs are excluded. Leads/orders retain the context, which is attribution rather than proof of payment.

Optionally build both sites with the same `NEXT_PUBLIC_GA_MEASUREMENT_ID`. An empty value disables analytics. Google scripts load after opt-in, with a preference control for refusal. Advertising storage, user data and personalization remain denied. Page views omit query strings. Configure both domains in the shared GA4 property and verify the linker on real HTTPS domains before relying on reports. References: [cross-domain measurement](https://developers.google.com/tag-platform/devguides/cross-domain), [consent configuration](https://developers.google.com/tag-platform/security/guides/consent).

Before release, configure domains, Sanity, operations secrets and the confirmed booking/attendance feed. Confirm pilot staffing, economics, dates and studio equipment. Reconcile Hub privacy/rental URLs with approved business policies. Local stage-one implementation is reviewable; actual session delivery, live data import, live analytics and public release require those operational inputs.
