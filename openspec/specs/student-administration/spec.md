# student-administration Specification

## Purpose

Give Academy administrators a single management interface for student records, invitations, access decisions, attendance and course progress.

## Requirements

### Requirement: Find and inspect a student

Academy administration SHALL distinguish a verified profile from a pending email grant and expose student orders, entitlements and learning statistics to authorized administrators.

#### Scenario: Unregistered student

- **WHEN** a manager opens the email record of a person with a grant and no verified account
- **THEN** the grant remains pending for that email and the manager can see access and invitation state separately.

#### Scenario: Student statistics

- **WHEN** a manager inspects a grant or course summary
- **THEN** completed lessons derive from passing quizzes in the assigned curriculum and package. Aggregate course statistics count a user once per course and retain historical progress where all access has ended.

#### Scenario: Legacy entry point

- **WHEN** a manager visits the former operations page
- **THEN** the page redirects to Academy student management. The former customers API returns a gone response.

### Requirement: Manage entitlements independently of payment

Academy administrators SHALL be able to grant, upgrade, extend, revoke, restore or migrate a specific entitlement with a reason and auditable before and after state.

#### Scenario: Grant access

- **WHEN** the manager selects a published course version and nonempty valid lesson subset for an email
- **THEN** the new access is recorded with its course, package and expiry, binds to an existing matching profile if present and queues a student invitation.

#### Scenario: Amend or revoke

- **WHEN** the manager modifies an existing student's grant
- **THEN** the target must match the email and course. Changing access leaves financial records and prior learning progress intact.

#### Scenario: Refunded purchase

- **WHEN** the manager requests restoration of a grant sourced from a fully refunded purchase
- **THEN** restoring that grant is refused. A separate administrative grant can be created with its own reason.

#### Scenario: Retry a grant

- **WHEN** the same grant request ID is retried with identical details
- **THEN** the existing grant is returned. A conflicting reuse is rejected.

### Requirement: Delegate administrator privileges

Only a currently authorized administrator with recent email verification SHALL be able to grant or revoke administrative roles. The last administrator SHALL remain in place.

#### Scenario: Delegate to a new address

- **WHEN** the manager grants privileges to an unregistered normalized address
- **THEN** the invitation remains pending until its ownership is verified and can be canceled before it is claimed.

#### Scenario: Concurrent changes

- **WHEN** administrators attempt role removals that would leave no administrator
- **THEN** role changes are serialized, removal of the last administrator is refused, and accepted changes record actor, target and reason.

### Requirement: Manage invitations and attendance

Administrators SHALL be able to inspect and resend eligible invitations and to manage the roster independently of lesson completion.

#### Scenario: Resend an invitation

- **WHEN** a manager resends for a student with active access or an eligible administrator
- **THEN** the request queues an email, shows its delivery state separately from account creation, and throttles duplicate resend requests within two minutes.

#### Scenario: Record attendance

- **WHEN** a manager selects participants from the lesson and applicable intake after the session ends
- **THEN** attendance can be confirmed or revoked with an audit record and without updating quiz progress. Canceled and unfinished meetings cannot accept attendance.

### Requirement: Manage promo codes and services

Academy administration SHALL expose promo management, service configuration status and the external ps-booking cashbox destination.

#### Scenario: Manage discount

- **WHEN** the administrator creates, edits, disables or deletes a promo code
- **THEN** usage and program/date constraints are retained; a code already referenced by an order can be disabled but cannot be deleted.

#### Scenario: View financial operations

- **WHEN** an administrator wants the shared cashbox
- **THEN** the workspace hands off to the configured HTTPS booking cashbox. Academy order history only describes local purchases.
