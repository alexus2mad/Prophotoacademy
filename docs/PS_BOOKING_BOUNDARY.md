# Cashbox belongs to ps-booking

Updated 9 October 2026 following the owner's correction. This supersedes the cashbox implementation section of the learning-platform plan.

## Verified existing implementation

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

The booking repository was inspected read-only; it has not been changed or deployed by this task.
