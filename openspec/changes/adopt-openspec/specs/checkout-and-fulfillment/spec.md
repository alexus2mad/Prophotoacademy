# checkout and fulfillment specification

## Purpose

Provide a reliable guest purchase journey with server-selected offers, explicit payment modes and purchase-specific learning rights.

## ADDED Requirements

### Requirement: A purchase selects an eligible offer

Checkout SHALL use the active content source and the server payment mode to validate the selected offering, program, package, eligibility, price and fulfillment.

#### Scenario: Available paid offer

- **WHEN** a visitor selects a purchasable package and submits valid contact details and purchase consent
- **THEN** the order uses that package's server price and currency and retains the selected offering and package identity.

#### Scenario: Unavailable package

- **WHEN** a caller follows a direct checkout URL or submits an explicitly closed, sold-out, archived, inquiry-only or mismatched package
- **THEN** the package cannot create an order, including when the caller enters directly instead of using a landing page.

#### Scenario: Enrollment after an intake starts

- **WHEN** a confirmed intake eligible for paid sales has already started
- **THEN** sales continue only where the configured late-enrollment rule permits it.

#### Scenario: Unrecognized payment mode

- **WHEN** the environment specifies an unsupported mode or live checkout lacks its required merchant configuration
- **THEN** checkout fails rather than issuing paid access for free.

#### Scenario: Direct diagnostic products

- **WHEN** the exact diagnostic offer and package are selected by direct link
- **THEN** the checkout demonstration is available only in mock mode. The one-hryvnia merchant diagnostic is a real product restricted to live mode and grants no lessons.

### Requirement: Mock and zero-charge enrollments

The Academy SHALL distinguish a demonstration order from an explicit zero-charge enrollment into a mapped course.

#### Scenario: Mock payment

- **WHEN** a mock buyer simulates an approved, pending, declined or canceled result
- **THEN** the order displays that demonstration state and cannot produce real access, a payment receipt or a provider transaction.

#### Scenario: Disabled course payment

- **WHEN** a guest enrolls with payment explicitly disabled for an eligible package mapped to published lessons
- **THEN** the order records zero due and the list price, creates or associates test access, and queues the confirmation with no money received.

#### Scenario: No test access through tickets

- **WHEN** a caller requests a product ticket or a course without published mapped lessons during zero-charge enrollment
- **THEN** the request does not grant test access.

#### Scenario: Repeated test enrollment

- **WHEN** the same normalized email enrolls again for the same offering and package
- **THEN** the existing test period and any revocation remain effective.

### Requirement: Checkout retries and discounts

A repeated identical checkout SHALL reuse the same order. Live discount eligibility and usage limits SHALL be checked when an order is created.

#### Scenario: Retried request

- **WHEN** the buyer retries with the same request key, status token and payload in the same mode
- **THEN** the response refers to the existing order; reusing that key for a different payload or token returns a conflict.

#### Scenario: Promo preview and reservation

- **WHEN** a buyer previews an active, in-date, program-eligible promo and starts checkout
- **THEN** the server revalidates and reserves usage atomically, rounds the discounted price down in whole hryvnias with a one-hryvnia minimum, and retains the original price.

#### Scenario: Unavailable promotion

- **WHEN** the code expires, reaches its usage limit, is disabled, or does not match the program
- **THEN** the order cannot claim that discount, even after an earlier successful preview.

### Requirement: Authoritative payment confirmation

Live fulfillment SHALL follow verified WayForPay status for a known local order, matching merchant, signature, amount and currency.

#### Scenario: Browser returns before confirmation

- **WHEN** the widget signals approval or the buyer reaches the thank-you page before the signed provider callback
- **THEN** the customer sees the stored order state and no learning rights are created by the redirect or widget signal.

#### Scenario: Paid mapped course

- **WHEN** the valid provider callback approves an order with a snapshotted published curriculum, lessons and access period
- **THEN** the payment, order transition, applicable grant and notification jobs commit together; repeating the callback creates no second entitlement or successful-payment notification.

#### Scenario: Unmapped course and standalone ticket

- **WHEN** an authorized live payment approves a course without a package rule or a standalone product
- **THEN** the former receives team-granted-access messaging and the latter a product payment confirmation. Neither receives an automatic lesson grant.

#### Scenario: Tokenized order status

- **WHEN** a buyer presents a valid status token
- **THEN** the status endpoint returns that order's display status, product, package, mode, access indicator and retry destination. The token cannot authorize lesson reads.

### Requirement: Access dates and refunds

A course grant SHALL retain its purchased release, lesson set and time window. Only a confirmed full refund SHALL revoke grants sourced from the refunded order.

#### Scenario: Cohort or self-paced start

- **WHEN** payment is confirmed for a mapped course
- **THEN** the grant starts at the later of confirmation and its configured intake start. An access period measured in months runs from that date; lifetime has no expiry.

#### Scenario: Full refund

- **WHEN** a refund callback is independently verified as covering the entire order
- **THEN** the order's grant is revoked, independent grants and learning history remain, and a duplicate approval cannot restore it.

#### Scenario: Partial or ambiguous refund

- **WHEN** provider status confirms a partial refund or fails to establish a refunded amount
- **THEN** partial refunds retain course access; an ambiguous confirmation is not accepted as a full refund. Merchant-wide refund submission and reconciliation belong to ps-booking.
