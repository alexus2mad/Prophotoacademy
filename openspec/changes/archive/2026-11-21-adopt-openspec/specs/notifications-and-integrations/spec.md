# notifications and integrations specification

## Purpose

Coordinate transactional messages, accepted inquiries and authenticated integration reads without coupling course access to external delivery.

## ADDED Requirements

### Requirement: Durable messages

The application SHALL queue transactional communications with the applicable order or grant and process delivery asynchronously with retry and deduplication.

#### Scenario: Payment notification

- **WHEN** a real order starts, then receives a verified successful, declined or refunded transition
- **THEN** the Academy queues the corresponding Make event using the stored order data and a stable order/event key. The configured downstream automation owns Telegram delivery.

#### Scenario: Delivery interruption

- **WHEN** a worker cannot deliver a queued job
- **THEN** it schedules a retry with backoff and the same delivery key without undoing payment or access.

#### Scenario: Invitation or mock order

- **WHEN** an invitation loses eligibility before delivery, or the worker encounters a mock order
- **THEN** the invalid invitation is canceled and the mock job remains local. Neither sends an external purchase confirmation.

#### Scenario: Email type

- **WHEN** an eligible invitation, enrollment, purchase or refund email is queued
- **THEN** the worker selects the matching transactional template and sender. OTP emails are sent separately by the configured identity provider.

### Requirement: Inquiries and activity

The Academy SHALL validate consent, contact details and referenced offers or practice sessions for inquiries and accept ecosystem activity only from an authorized machine integration.

#### Scenario: Valid inquiry

- **WHEN** a visitor consents to contact and requests help for a known program, package or active practice session
- **THEN** the request retains the verified context, source and distinct marketing preference. The managed store queues notification with the inquiry.

#### Scenario: Bot or inconsistent request

- **WHEN** the form's honeypot is filled or the specified package does not belong to the specified offer
- **THEN** the honeypot receives a success response without persisting the request, and a mismatched offer or package is rejected.

#### Scenario: Imported customer event

- **WHEN** a trusted source submits course, practice or room activity
- **THEN** known references are validated. A source/event identifier updates only for newer data; studio booking activity remains distinct from a payment.

### Requirement: Authenticated ps-booking bridge

The customer-card integration SHALL return a minimal Academy projection for exact normalized emails only after verifying the signed request and current Academy administrator session.

#### Scenario: Verified account or pending rights

- **WHEN** booking requests a customer summary for its customer's saved email addresses
- **THEN** the result distinguishes registered identity from pending access, groups eligible grants by course, includes package and access dates, and omits revoked, expired or empty grants.

#### Scenario: Untrusted bridge request

- **WHEN** the signature or timestamp is invalid, the nonce was already used, or an authenticated management read lacks a current administrator session
- **THEN** the request is rejected without disclosing account data or applying a management operation.

#### Scenario: Legacy API consumer

- **WHEN** an authorized legacy management consumer calls a supported administrative action
- **THEN** existing verification, authorization, freshness and auditing rules still apply. The current booking customer card remains a read-only client of the Academy data.

### Requirement: Scheduled notification delivery

The scheduled delivery endpoint SHALL require its distinct machine credential.

#### Scenario: Delivery run

- **WHEN** the scheduler calls the platform job with a valid credential
- **THEN** it attempts a bounded batch of eligible outbox jobs and returns the delivery count. An unauthorized call is rejected.
