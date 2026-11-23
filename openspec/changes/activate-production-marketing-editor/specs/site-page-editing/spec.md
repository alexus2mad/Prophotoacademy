## ADDED Requirements

### Requirement: Independent production marketing storage
The production Academy editor SHALL use a dedicated marketing project and server-side writer. Public rendering SHALL use anonymous published reads and the production service SHALL preserve private learning and payment configuration.

#### Scenario: Release production authoring
- **WHEN** the verified editor is activated on production
- **THEN** the initial marketing pages render the approved live content, administrators can save a draft and publish it, and anonymous requests cannot retrieve the draft or modify the page.

#### Scenario: Reject a cross-environment configuration
- **WHEN** the deployed Academy origin is configured with the other environment’s marketing project or a private learning credential
- **THEN** marketing writes are unavailable.
