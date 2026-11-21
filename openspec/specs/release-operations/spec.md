# release-operations Specification

## Purpose

Build, activate, verify and retain Academy releases with separate credentials, data and payment behavior for each environment.

## Requirements

### Requirement: Isolated candidates
Each environment SHALL build from committed source and its reviewed public configuration.

#### Scenario: Candidate inputs contain unsafe archive members or non-public keys
- **WHEN** an isolated builder receives unsafe archive members or disallowed environment keys
- **THEN** the candidate build rejects the input before using it.

### Requirement: Independent environments
Staging and production SHALL preserve independent data, runtime configuration and payment modes through release.

#### Scenario: The same verified change is delivered to both sites
- **WHEN** the same verified change is delivered to both sites
- **THEN** each uses its own build settings; staging remains test-only and production uses its live payment configuration.

### Requirement: Database readiness
The health endpoint SHALL expose readiness without disclosing database errors or caching a stale result.

#### Scenario: The required database migration cannot be found or the query fails
- **WHEN** the required database migration cannot be found or the query fails
- **THEN** the endpoint returns HTTP 503 and a false readiness result with no-store.

### Requirement: Rollback retention
A verified deployment SHALL retain the active release and one explicitly selected verified rollback release.

#### Scenario: The active target changes between a cleanup plan and application or the health check fails
- **WHEN** the active target changes between a cleanup plan and application or the health check fails
- **THEN** cleanup stops rather than removing a release under stale assumptions.

### Requirement: Backup and recovery
The documented recovery procedure SHALL verify encrypted backups and rehearse restoration independently of the live services.

#### Scenario: An export fails or verification does not finish successfully
- **WHEN** an export fails or verification does not finish successfully
- **THEN** operators follow the backup runbook to retain prior recovery points and investigate the failed run.

### Requirement: Staging preview gallery
A staging application release SHALL preserve the independently served social-image review page.

#### Scenario: A new application release is activated
- **WHEN** a new application release is activated
- **THEN** the public staging gallery remains available with its indexability restrictions.
