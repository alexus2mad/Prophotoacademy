## ADDED Requirements

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
