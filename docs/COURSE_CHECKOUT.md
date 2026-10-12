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

## Real payment activation

Apply migration `202610120001` before deploying enrollment support. Configure `WAYFORPAY_MERCHANT_ACCOUNT`, `WAYFORPAY_MERCHANT_SECRET`, `WAYFORPAY_MERCHANT_DOMAIN` and the HTTPS Academy origin. Confirm current marketing intake dates/availability and package mappings, then set `PAYMENT_MODE=wayforpay` and restart the app. No front-end rebuild is needed for the mode change; checkout and course detail pages use runtime configuration.

Verify a provider test payment, duplicate callback, failure and refund before accepting real charges. Preserve `/api/checkout`, `/api/payments/wayforpay/callback` and `/thanks`. A successful browser redirect still grants nothing. Cashbox/import/refund operations remain owned by ps-booking.

GitHub Pages cannot enroll students. The isolated local sandbox runs the real enrollment service against synthetic persisted data in disabled mode; provider callbacks, email dispatch and cashbox mutations remain blocked.
