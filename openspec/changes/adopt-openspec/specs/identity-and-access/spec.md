# identity and access specification

## Purpose

Keep device sessions and verified Academy identity separate from pending email invitations, checkout tokens and external booking accounts.

## ADDED Requirements

### Requirement: Verified email identity

Signing in SHALL establish an Academy profile by verified email ownership and immutable user ID. Email matching SHALL trim and lowercase the address without merging aliases or other contact details.

#### Scenario: First verified sign-in

- **WHEN** a person confirms a valid email code for an address with unclaimed entitlements
- **THEN** the matched grants attach to that user ID and an applicable pending administrator invitation is claimed.

#### Scenario: Unverified address

- **WHEN** someone submits an address or a code that is incorrect or expired
- **THEN** no profile rights are granted merely because the address was submitted. Repeated send and verify requests are rate limited.

#### Scenario: Account email mismatch

- **WHEN** an existing identity presents a different verified address
- **THEN** the existing identity is not silently merged with another profile.

### Requirement: Persistent device session

The Academy SHALL maintain a refreshable persistent device session and keep fresh verification for sensitive privilege changes separate from ordinary browsing.

#### Scenario: Reopen the account

- **WHEN** the user returns with a valid refreshable session
- **THEN** account, learning and admin destinations can resume without routinely requesting a new code.

#### Scenario: Sign out

- **WHEN** the signed-in user chooses logout
- **THEN** the local device session is ended and private pages require sign-in again.

#### Scenario: Fresh verification needed

- **WHEN** a signed-in administrator attempts to change privileges more than ten minutes after confirming the code for this session
- **THEN** the change requires another code without treating the person as a newly created account.

### Requirement: Protected routes and identity settings

Private routes SHALL enforce the current member role on the server and constrain the login return destination to Academy workspaces.

#### Scenario: Unauthenticated deep link

- **WHEN** a visitor opens a private account, lesson or administration page
- **THEN** login offers a return to the requested safe workspace path. Invalid or external return paths fall back to the account.

#### Scenario: Student follows admin link

- **WHEN** a signed-in student opens an administrator page or requests an administrator API
- **THEN** the page returns them to their account and the API denies the operation.

#### Scenario: Edit display name

- **WHEN** a signed-in user saves a valid display name
- **THEN** only that member's profile is updated; their login email and user ID retain their existing ownership.

#### Scenario: Only one bootstrap

- **WHEN** the designated bootstrap address verifies for the first time and later signs in again after delegation and removal
- **THEN** the system records its one-time initialization and does not automatically restore a removed administrative role.
