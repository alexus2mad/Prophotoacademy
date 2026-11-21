## Purpose

Support safe evaluation of student, management and purchase journeys without opening a real payment or exposing production course material.

## ADDED Requirements

### Requirement: Static review
The Pages build SHALL use a separate static export with synthetic records, prefixed assets and noindex guidance.

#### Scenario: A visitor enters the Pages checkout or tries to access private learning operations
- **WHEN** a visitor enters the Pages checkout or tries to access private learning operations
- **THEN** the review presents the available demonstration or an unavailable state without performing the live action.

### Requirement: Local sandbox
Local rehearsals SHALL use isolated infrastructure and persist synthetic course and account data across restarts.

#### Scenario: A manager publishes a rehearsal course and grants a sandbox student access
- **WHEN** a manager publishes a rehearsal course and grants a sandbox student access
- **THEN** the student can open the course in the local learning experience and the grant survives a normal sandbox restart.

### Requirement: Preview boundaries
The sandbox SHALL keep infrastructure credentials and management operations separate from public browser requests.

#### Scenario: A browser directly calls the sandbox RPC service or requests a media grant it was never issued
- **WHEN** a browser directly calls the sandbox RPC service or requests a media grant it was never issued
- **THEN** the service rejects the operation.

### Requirement: Publish validated review artifacts
Publishing the review SHALL use the validated static export and target the review branch.

#### Scenario: A Pages build includes forbidden live endpoints or incorrectly prefixed asset paths
- **WHEN** a Pages build includes forbidden live endpoints or incorrectly prefixed asset paths
- **THEN** the review validation reports failure before publication.
