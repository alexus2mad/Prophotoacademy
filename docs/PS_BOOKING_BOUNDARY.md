# Academy student management and the ps-booking cashbox

Since 17 October 2026, Academy owns the editable student and team workspaces, access, learning statistics and attendance. Managers use `/admin/students` and `/admin/team`. Booking owns the shared cashbox and provides a read-only Academy summary in its customer card. Academy, studio and cashbox roles have separate authorization.

## Management integration

The 9 October implementation hosted editable student-management screens in booking. That UI was superseded on 17 October. The signed bridge remains compatible with earlier authenticated management operations. Booking migration `017-academy-management.sql` stores encrypted upstream management credentials. Academy migration `202610090003_booking_management.sql` stores their hashes, verified identities and replay nonces.

Booking's `/api/academy/*` endpoints call Academy's fixed `/api/integrations/ps-booking` route over HTTPS. Both servers share a random 32+ character key. The signed body contains an action, validated input and an opaque verified-user credential; browsers never receive that credential. Timestamp validation, single-use nonces, current-role checks and recent verification protect commands. Access and privilege mutations are audited. Last-admin removal is prevented transactionally.

Academy's browser admin API handles course authoring, student access, invitations, role changes, promo codes and attendance. Identity, access and progress live in Academy PostgreSQL. `/operations` redirects to `/admin/students`. `/api/operations/customers` is retired and returns HTTP 410. See the [learning operations runbook](LEARNING_OPERATIONS.md) and [platform evidence](openspec/platform.md).

## Customer-card account connection

Booking customer cards use the signed `customer.summary` action to read a minimal Academy projection: verified account ID/email and course access (title, package, start, expiry). The action requires the same current verified administrator session as other management reads. The booking endpoint additionally requires its studio-manager session and derives lookup emails from the saved customer contacts, never from caller-supplied search parameters.

Matching is exact after trimming and lowercasing; no phone/name matching or Gmail alias consolidation. Shared CRM email contacts and multiple matching accounts require review. There is no persisted email-based authorization or duplicate student store: registered-account grants are selected by immutable user ID. Pending unclaimed grants remain distinct from a verified account. Revoked, expired and empty grants are omitted, and future intake start dates remain explicit. CRM contact changes neither update the login nor grant course access.

## Historical evidence from the booking repository

Repository: `alexus2mad/ps-booking`, local checkout `E:/Projects/WIX_Koren_studio`, inspected commit `0033f86`.

- `server/wayforpay.js` imports transaction lists in up to 31-day windows, caches them and builds financial reports
- `server/migrations/016-wayforpay.sql` stores payment and refund rows separately
- `config/wayforpay-products.json` already maps Academy products and packages
- `public/admin-cashbox.js` implements the cashbox and its date/channel filters
- `GET /api/admin/wayforpay/revenue`, `POST /api/admin/wayforpay/sync`, `GET/PATCH /api/admin/wayforpay/products` use the booking manager's own authenticated session
- Cashbox destination: `https://booking.plainstack.net/admin.html?view=cashbox&channel=wayforpay`

No live account, customer, payment or booking data was read or changed for this inspection.

## Academy responsibility

Retain checkout, package snapshots, accepted payment events, personal purchase history and access grants. The verified WayForPay callback fulfills a known Academy order transactionally. A refund callback checks the provider's current order status and exact cumulative refund amount before revoking the purchase grant. Partial refunds preserve access. Retries cannot restore revoked grants.

The existing `academy.transactions` table is a local receipt projection for known Academy orders, not the shared financial ledger. The original foundation migration's `refunds` and `sync_runs` tables remain inert for migration compatibility; no routes or jobs write to them. Do not report financial totals from customer activity or this local projection.

Removed from the Academy implementation: duplicate cashbox report/export, merchant-wide sync, refund reservation/submission and multi-merchant configuration. The Academy platform cron only delivers queued notifications.

## Integration gaps to address in the owning repository

The inspected ps-booking version has no payment-event delivery endpoint, full/partial refund command, or email-linked transaction history. It intentionally does not retain payer email, phone or card data. Do not claim these features already exist.

If adding refund initiation or Academy reconciliation, implement it in ps-booking. Define authenticated, retryable events keyed by merchant and order reference, with unique event IDs, exact amount/currency, cumulative confirmed refund amount and immutable purchase reference. Academy must verify the sender, match a known order and process it idempotently. Never use product-title matching to assign a student's access. Keep customer data minimal and do not expose merchant keys or shared browser sessions.

Until that producer exists, immediate fulfillment uses the existing Academy callback. Missed callback/refund recovery across the two services remains a release integration item; an admin can explicitly change course access without creating a financial effect.

Verify changes to booking endpoints or cashbox behavior in the owning repository. The historical checkout inspection above does not establish the currently deployed booking revision.
