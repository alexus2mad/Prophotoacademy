# Pro Photo Academy

A local Next.js + Sanity implementation of the academy redesign. Ukrainian content, a direct program catalog, course details, student photography, inquiries and checkout are included. The current default uses the reviewed migration fixture and local payment simulation.

## Run locally

Requires Node 22.12+ and pnpm. This workspace uses Node 22.20.

```powershell
cd E:\Projects\photoacademy\web
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Open **http://127.0.0.1:3000/**. The default modes are `CONTENT_MODE=fixture`, `PAYMENT_MODE=mock`, `NOTIFICATION_MODE=local`. No Sanity credentials are needed to review the site. Local inquiries are saved to SQLite and clearly identified as local captures. Mock orders never charge money or send payment notifications externally.

The current preview is already running. The synthetic checkout is **/checkout?demo=1**; it is separate from the academy’s unverified offers and is unavailable in real payment mode.

## Verify

```powershell
pnpm typecheck
pnpm test
pnpm content:validate
pnpm content:migrate
node scripts/validate-sanity-query.mjs
pnpm build
```

`content:migrate` defaults to a dry run. It writes the proposed import and provenance/conflict manifest to `content/generated/`. The GROQ check evaluates the real content query against those documents, including a new program without an imported ID. API tests cover purchase snapshots, idempotency, enrollment restrictions, callback signatures, order privacy, inquiries, package context and notification retries/concurrent workers.

Browser review uses the rendered local site; see `reports/design-review.md` for the independent critique and implemented responses. Design rationale, precise tokens and reference projects are in `DESIGN.md`.

## Content architecture

| Sanity type | Responsibility |
| --- | --- |
| `program` | Evergreen course/class description, optional homepage introduction, audience, outcomes, curriculum, FAQs, instructors, cover, student work, SEO |
| `offering` | Intake date, format, duration, availability and price packages; explicit verification gate |
| `editorialImage` | Photography, accessible text, credit, Drive provenance, crop/hotspot and optional focal override |
| `instructor` | Name, role, biography and portrait |
| `studentWork` | Gallery title, equipment, photo and confirmed author when known |
| `testimonial` | Attributed student quotation or academy-written case story, distinguished explicitly |
| `editorialPage` | Legal content in Portable Text |
| `siteSettings` | Primary course selection, general homepage fallback, contacts and external links |

Imported IDs remain stable. New documents use their native Sanity IDs. Programs and intakes are separate so a new cohort does not require duplicating the entire course. The frontend reads published content by default and authenticated drafts in preview. It does not silently substitute the fixture when Sanity is misconfigured.

## Connect Sanity

1. Supply `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, a server-only read token and a server-only migration write token in `.env.local`.
2. Configure the project’s authenticated Studio/CORS origins for the intended local origin. Open `/studio` and verify the schema. An unconfigured Studio explains what is missing.
3. Review the dry-run documents and source conflicts, then run `pnpm content:migrate --write`. The script uploads the selected photographs with provenance, deduplicates assets by hash and uses `createIfNotExists` to preserve existing editorial changes.
4. Set `CONTENT_MODE=sanity` and restart Next.js. Studio Presentation preview enables draft mode through a validated Sanity preview token; the frontend shows a draft banner with an exit action.
5. Confirm the dates, prices and package availability in each intake before explicitly clearing its verification flag. Past dates, sold-out packages and unverified intakes cannot be purchased server-side.

The migration was prepared and dry-run validated locally. No cloud dataset was modified in this implementation because credentials were not supplied.

## Connect payments and notifications

WayForPay purchase fields and signatures are generated on the server from a stored price snapshot. The browser cannot set the amount. Callback verification checks the signature, merchant, order, currency and amount before changing order state. Return URLs show status; they do not approve an order.

For live configuration, set `PAYMENT_MODE=wayforpay`, the merchant account/domain and a fresh merchant secret, and a publicly reachable HTTPS `NEXT_PUBLIC_SITE_URL`. Configure the provider callback at `/api/payments/wayforpay/callback` and validate the provider’s test flow before accepting live purchases. The previous site’s embedded payment secret is not reused.

For Make delivery, set `NOTIFICATION_MODE=make` and an HTTPS `MAKE_WEBHOOK_URL`, then run `pnpm outbox:deliver` periodically on the same Node host. The command loads `.env.local`, leases jobs to avoid concurrent sends and retries failures with backoff. Make must deduplicate by `eventId`/`Idempotency-Key`: network delivery can be retried after an ambiguous response. Configure the destination scenario to send the appropriate confirmations and team notifications. The site does not start an external automation automatically.

Store `DATABASE_PATH` on durable storage. The default `.data/academy.sqlite` contains order/inquiry records and notification jobs. This implementation expects a persistent Node process and volume; an ephemeral function host needs an appropriate durable database adapter. `.data`, credentials and captured source pages are excluded from production file tracing. Behind a trusted proxy that replaces forwarding headers, set `TRUST_PROXY=1` for per-address request limits.

Live Sanity preview, provider payments and Make delivery remain unverified until configured. The local flows are independently reviewable without those integrations.

## Migration and assets

See `MIGRATION.md`. The connected Webflow site returned an empty collection list, so useful content was normalized from static pages and source assets. The 6 programs, 6 intakes, 15 selected photographs, 2 instructors, 6 student works, 16 reviews/case stories, 2 legal pages and site settings produce 54 Sanity documents plus image assets.

Original route slugs are preserved for courses and legal pages. Individual and corporate training have direct new routes. Utility redirects lead to useful pages. Student work and the complete catalog are directly accessible from the header.

The supplied ProPhoto Study vector logo appears in header and footer. Display SVGs remove unused export-artboard margins while preserving vector paths. KyivType Sans is the supplied brand display font; Manrope is self-hosted for body text and controls. Photography is optimized WebP with responsive Next Image delivery, descriptive alt text and original credits. No stock or generated photography is substituted.

## Homepage course priority

In Studio → Site settings, choose **Основна програма** to feature a course in the homepage opening and put it first in the catalog. Its cover, title, format and duration are reused. The optional **Homepage course introduction** on the program provides concise opening copy; the regular summary is the fallback. Clear the selection to restore the general academy opening. The selected course is omitted from the secondary homepage previews. Course-specific testimonials appear only when their program reference is confirmed; other reviews retain an academy-wide heading. The local fixture and dry-run migration currently select Інста, яка продає.
