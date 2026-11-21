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

### Requirement: Edit visible content in place

The writable administrator preview SHALL let managers activate an identifiable rendered text field or image in place. The canvas and inspector SHALL share the same working values and preserve the existing save and publish boundaries.

#### Scenario: Edit and cancel copy where it appears
- **WHEN** a manager activates a visible text field with a pointer or keyboard and types or pastes plain text
- **THEN** the edit appears in context, the inspector reflects the working value, and Escape can restore the value from the start of that edit without changing a neighboring field.

#### Scenario: Replace the selected photograph
- **WHEN** a manager selects an editable photo in the canvas and chooses a supported image
- **THEN** the selected field shows the uploaded photo in the preview and inspector, and canceling or failing an upload leaves the previous photo in place.

#### Scenario: Save and publish explicitly
- **WHEN** a manager edits an item in the desktop or phone preview and saves a draft
- **THEN** reopening the editor shows the saved edit, a public visitor still sees the publication, and the edited value becomes public only after the manager publishes.

#### Scenario: Keep the read-only preview safe
- **WHEN** the storage adapter is read-only or a visual element cannot be attributed to an editable field
- **THEN** the preview does not change a page field through that element, and viewing the public page exposes no editing controls.
