# spec-driven-development Specification

## Purpose

Keep Academy implementation work traceable to the requested behavior, the approved design and an independently verifiable outcome.

## Requirements

### Requirement: Establish scope before implementation
Every repository change SHALL name an OpenSpec change, describe its scope and define how the result will be verified before implementation.

#### Scenario: A designer requests a price background removal
- **WHEN** the request only changes the price treatment
- **THEN** the change describes that visual adjustment and checks the existing purchase interaction; adding a purchase button requires a scope decision.

#### Scenario: An explicit implementation request has a settled scope
- **WHEN** the acceptance criteria and design are clear
- **THEN** the agent may complete the scoped implementation and verification without a second approval.

#### Scenario: An internal change preserves existing behavior
- **WHEN** the work requires no new or modified capability requirement
- **THEN** the proposal explains why, the change declares `skip_specs: true`, and its tasks still identify verification.

### Requirement: Trace implementation to a change
Contributors SHALL link implementation commits to an identifiable OpenSpec change. The source workflow SHALL check the link on pushes and pull requests.

#### Scenario: An implementation commit omits its reference
- **WHEN** a post-adoption implementation commit is checked
- **THEN** a missing or unknown change ID produces a failing check and an actionable diagnostic.

#### Scenario: A finished change has been archived
- **WHEN** a commit references its valid archived change ID
- **THEN** the check can resolve the reference and accept it.

### Requirement: Maintain an auditable current baseline
The repository SHALL validate canonical specs, active changes, archived task completion and the entry-point inventory, alongside behavioral verification appropriate to each change.

#### Scenario: A contributor introduces an unlisted route
- **WHEN** the inventory is checked
- **THEN** the check identifies the missing entry point until a capability mapping is supplied.

#### Scenario: A change is ready to archive
- **WHEN** the author has checked the implementation against the scenarios and completed the tracked tasks
- **THEN** archiving applies the deltas to canonical specs and preserves the change history for future contributors.
