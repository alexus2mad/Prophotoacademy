# site-page-editing Specification

## Purpose

Let authorized Academy managers maintain public page copy and photographs in context and publish verified changes without writing code.

## Requirements

### Requirement: Edit a recognizable page
The editor SHALL identify pages and their editable sections in Ukrainian and offer labeled text and image fields with the current values.

#### Scenario: A manager updates a workshop
- **WHEN** the manager opens its page from the content library
- **THEN** they can identify the intended section, see its existing copy and photograph, edit the values and save a draft.

### Requirement: Preview before explicit publication
The editor SHALL distinguish draft from published content and render the draft in the site's design.

#### Scenario: Inspect a saved draft
- **WHEN** a manager previews a draft at phone or desktop width
- **THEN** the preview shows the saved changes while an ordinary visitor continues to receive published content.

### Requirement: Protect editorial operations
Management operations SHALL require Academy administrator authorization and reject stale writes with an actionable recovery state.

#### Scenario: Two managers edit the same page
- **WHEN** a manager saves or publishes a revision that has since changed
- **THEN** the operation reports a conflict without replacing the other manager's changes.

### Requirement: Create pages
Managers SHALL be able to create public course, workshop or general landing content at an available path.

#### Scenario: Publish a new page
- **WHEN** a manager selects a page type, supplies content and publishes to a free path
- **THEN** the public route renders the approved landing structure without inventing prices or checkout eligibility.

### Requirement: Isolated staging marketing access
The Academy staging editor SHALL publish only to its designated public marketing dataset with a dedicated staging editor credential. Static review builds SHALL exclude that credential.

#### Scenario: Staging editor is enabled
- **WHEN** an operator configures a staging marketing target or credential that is missing, shared with learning, generic, or points outside the designated project and dataset
- **THEN** the staging validation rejects activation and the application cannot write with those settings.

#### Scenario: A non-staging installation already has a configured marketing writer
- **WHEN** that installation runs with its existing marketing token
- **THEN** the editor continues to use that configuration and keeps private learning data separate.
