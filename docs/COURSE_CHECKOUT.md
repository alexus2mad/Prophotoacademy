# Course enrollment and payment activation

The owner requested payment-disabled enrollment on 12 October 2026. This is an explicit rollout mode, not a simulated successful payment. Account verification, published curriculum, package eligibility, media authorization and access administration remain in effect.

## Modes

| Server setting | Result |
| --- | --- |
| `PAYMENT_MODE=mock` (default) | Checkout demonstration only, no learning access |
| `PAYMENT_MODE=disabled` | Real test enrollment with zero amount due and no financial transaction |
| `PAYMENT_MODE=wayforpay` | Provider checkout; only verified callbacks grant access |

Never infer free access from missing provider keys. Unknown modes fail closed. Browser input cannot choose a mode, price, course rights or access duration. Existing orders retain their original mode.

## Manager workflow

1. In Academy course authoring, supply lessons and required materials, then choose the completed lessons in the publishing dialog. Unselected outlines remain in the draft; empty modules are excluded from the immutable release. Selected lessons still undergo all text, quiz and media validation
2. In the course's package configuration, choose its published curriculum and lessons, then save the access period and optional intake start
3. Open the corresponding course landing page: eligible mapped packages now offer test enrollment while payment mode is disabled
4. Manage student access, extensions, revocation and restoration through the linked ps-booking manager

The test package card and checkout show the lesson titles from the package's assigned release and lesson IDs. This identifies the available teaching material without implying that an unfinished full curriculum is ready. The public query exposes titles only; private blocks, assets and quiz keys remain protected.

Test enrollment can exercise published material from an old/unverified intake without claiming that its historical dates are current. Sold-out and archived offerings/packages remain closed. Unpublished or unmapped packages cannot enroll. Mapping a package makes it eligible during the disabled rollout; publish and map only material intended for testers. Enabling paid mode restores the existing confirmed-intake, current-date and package availability checks.

## Student workflow

Choose a package → review zero amount due → submit contact details and consent → open the account → verify the checkout email if needed. A verified existing account receives access immediately. The return URL and order token are never credentials for protected lessons.

Order, grant, audit record and confirmation-email job commit in one database transaction. Email delivery failure does not delay access. Each test order has `mode=disabled`, `status=enrolled`, `amount=0` and the ordinary package price saved separately in `listAmount`. The grant has `source=test`; no provider transaction, payment event or cashbox receipt is created. Per-user history labels it “Тестовий запис без оплати”.

Exact submission retries return the same order. A new submission for the same email/offering/package cannot renew the test period or undo revocation. Email claiming and grant creation share an identity lock. Access dates, package lessons and curriculum version are snapshotted just as for a paid purchase. Existing test grants are not charged or revoked automatically when payments are enabled.

## Products, promo codes and Make.com

These follow the original Webflow site's payment flow, with prices and discounts decided by the server.

**Product packages.** A package with `kind: "product"` is a paid item without lessons: an event ticket such as Pro Photo Lab, or a service. It needs no package rule in course authoring and never creates a grant. Its verified payment is recorded as a transaction and payment event like any order; the buyer receives an “Оплату підтверджено” email and status page instead of a course link. Products are sold only in `wayforpay` mode, under the ordinary paid-mode checks: confirmed intake (`verificationRequired: false`), `open`/`limited` availability and a start date that has not passed. To sell tickets for the next event, add an offering with those values and product packages to the content; the finished 26 September 2026 event stays archived.

**Test payment.** `/checkout?offering=test-payment&package=test-1uah` charges a real 1 UAH for an end-to-end check of the merchant, callback, receipt email and cashbox. It is defined in code, linked from nowhere, never indexed, grants nothing, and exists only in `wayforpay` mode. Refund test payments from the WayForPay merchant cabinet.

**Checkout form.** Name, email and phone are required; Telegram and Instagram nicknames are optional and stored with the order for the academy's follow-up. Paying opens WayForPay's on-page widget (`pay-widget.js`), loaded only when the buyer submits. If the widget cannot load, the browser falls back to WayForPay's hosted page with the same signed fields. Closing or declining in the widget lets the buyer try again with a new order reference, because WayForPay does not accept a second payment for one reference.

**Promo codes.** Managers create codes in Academy admin → Промокоди: a percentage from 1 to 90, optional start and end days, an optional limit on paid uses and optional program scope (none selected means every program and ticket). Codes are deactivated rather than deleted, and creating a code never overwrites an existing one. The buyer can preview the discounted total; the order applies the code again inside its own transaction, under a per-code lock, and stores `promoCode`, `discountPercent`, the discounted `amount` and the full `listAmount`. A use is held by paid orders and by other buyers' checkouts from the last 30 minutes, so a buyer can retry an abandoned payment with a single-use code. Discounts round to whole hryvnias and never go below 1 UAH. Editing a code never changes existing orders.

**Make.com.** With `MAKE_WEBHOOK_URL` set, the outbox delivers the original site's events: `payment_start` when an order is created, `payment_approved`/`payment_declined`/`payment_pending` from the widget, and `payment_success_server`/`payment_decline_server`/`payment_refund_server` after a verified callback. Each event carries the original `formData` (name, phone, telegram, instagram, promocode, email) and `productData` shape, built from the stored order rather than from the browser. Widget events are hints for the scenario only: they never change an order or grant access. Each event is delivered once per order and retried with backoff. Without the URL, events stay in the outbox as local records.

## Real payment activation

Apply migrations `202610120001` (enrollment) and `202610170001` (promo codes) before deploying the matching releases. Configure `WAYFORPAY_MERCHANT_ACCOUNT`, `WAYFORPAY_MERCHANT_SECRET`, `WAYFORPAY_MERCHANT_DOMAIN` and the HTTPS Academy origin. Set `MAKE_WEBHOOK_URL` to the academy's Make.com payment scenario when its events are wanted; leave it unset on staging so test orders never reach the live scenario. Confirm current marketing intake dates/availability and package mappings, then set `PAYMENT_MODE=wayforpay` and restart the app. No front-end rebuild is needed for the mode change; checkout and course detail pages use runtime configuration.

Verify a provider test payment (the 1 UAH test product above), duplicate callback, failure and refund before accepting real charges. Preserve `/api/checkout`, `/api/payments/wayforpay/callback` and `/thanks`. A successful browser redirect still grants nothing. Cashbox/import/refund operations remain owned by ps-booking.

GitHub Pages cannot enroll students. The isolated local sandbox runs the real enrollment service against synthetic persisted data in disabled mode; provider callbacks, email dispatch and cashbox mutations remain blocked.
