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
The Academy staging editor SHALL publish only to its designated public dataset in a marketing-only staging project with a dedicated server-side credential. Public staging page reads SHALL use anonymous access to that dataset. Static review builds SHALL exclude the credential.

#### Scenario: Staging editor is enabled
- **WHEN** an operator configures a staging marketing target or credential that is missing, shared with learning, generic, or points outside the designated project and dataset
- **THEN** the staging validation rejects activation and the application cannot write with those settings.

#### Scenario: A staging administrator publishes a page and replaces its photo
- **WHEN** a staging administrator saves and publishes text and a replacement photograph
- **THEN** the public page reads the published revision and image from the marketing project, the saved draft stays private until publication and private learning continues using its original project.

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

### Requirement: Compose pages using a block library
The writable editor SHALL provide named visual choices for a heading, paragraph, photograph, card collection and image carousel, with editable content, keyboard-operable ordering, duplication and removal.

#### Scenario: Compose a landing
- **WHEN** an administrator inserts blocks, changes their order, duplicates a collection and edits individual cards or slides
- **THEN** the working preview shows the changes, identifiers remain stable on moves, duplicate content can be edited independently and visitors receive the approved order only after publication.

#### Scenario: Extend an existing marketing page
- **WHEN** an administrator opens an existing page and adds content to its editorial region
- **THEN** existing content, offer behavior and previously saved values are preserved, and a page with no added content retains its presentation.

### Requirement: Create pages from independent templates
The editor SHALL offer distinguishable blank, editorial, course and workshop starting layouts with a preview or description when creating a page.

#### Scenario: Create from a preset
- **WHEN** an administrator selects a template and creates a draft at an available path
- **THEN** its editable sections reflect that choice, other pages are unaffected, and creating a presentation supplies no payment or event availability.

### Requirement: Find and reuse marketing photographs
The editor SHALL provide an authenticated, searchable, paginated image library with visual thumbnails, existing public Academy imagery and marketing uploads, accessible from image fields and the canvas.

#### Scenario: Reuse an image
- **WHEN** a manager uploads a photo or picks a previously available photo for a card, slide or ordinary field
- **THEN** the selection applies to the intended placement, a later editor session can find and reuse it, and canceling the picker preserves its previous value.

### Requirement: Style editable text
The editor SHALL allow managers to choose and reset font, size, color, weight and alignment for visible editorial text without accepting executable markup or arbitrary CSS.

#### Scenario: Format copy
- **WHEN** an administrator styles a supported visual field and saves the draft
- **THEN** the working preview and reopened draft show the chosen treatment, the published page applies it only after publication, and resetting restores the inherited style.

### Requirement: Place authored blocks between existing page sections
The writable editor SHALL support inserting and moving authored blocks directly at supported native section boundaries and between authored blocks in the page preview.

#### Scenario: Insert at a visible section boundary
- **WHEN** an administrator opens the block library from a preview insertion point and chooses a block
- **THEN** the working canvas displays the block at that point and its fields can be edited immediately.

#### Scenario: Move a block directly
- **WHEN** an administrator moves an authored block using its preview handle, or selects its destination without dragging
- **THEN** the canvas reflects that position, preserves all fields, styles and child identities, and leaves native sections in their designed order.

#### Scenario: Cancel a move
- **WHEN** the gesture is canceled or the administrator chooses the original position
- **THEN** content and order remain unchanged.

#### Scenario: Publish an arranged page
- **WHEN** the arrangement is saved, reopened and explicitly published
- **THEN** the saved preview and the public HTML show the same order and each block appears once. Until publication visitors see the previous arrangement.

#### Scenario: Maintain existing pages and trusted boundaries
- **WHEN** an existing document has blocks without placement, the editor is read-only, or a submitted placement does not belong to the page
- **THEN** legacy blocks keep their former position, visitors and read-only viewers receive no placement controls, and unsupported placement writes are rejected.
