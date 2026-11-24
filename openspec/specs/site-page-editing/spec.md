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

### Requirement: Independent production marketing storage
The production Academy editor SHALL use a dedicated marketing project and server-side writer. Public rendering SHALL use anonymous published reads and the production service SHALL preserve private learning and payment configuration.

#### Scenario: Release production authoring
- **WHEN** the verified editor is activated on production
- **THEN** the initial marketing pages render the approved live content, administrators can save a draft and publish it, and anonymous requests cannot retrieve the draft or modify the page.

#### Scenario: Reject a cross-environment configuration
- **WHEN** the deployed Academy origin is configured with the other environment’s marketing project or a private learning credential
- **THEN** marketing writes are unavailable.

### Requirement: Author practical workshops in the visual editor
An administrator SHALL be able to create a workshop with a photographic cover, an editorial introduction, a curriculum accordion, a photo gallery, format highlights and an offer section. The editor SHALL support page-specific copy, original library images and a governed ticket that purchases the selected workshop.

#### Scenario: Author and publish in the editor
- **WHEN** the administrator creates a practical workshop, fills its sections and publishes
- **THEN** desktop and mobile visitors see the authored copy, ordered photographs and interactions, and the administrator can reopen and edit the saved document.

#### Scenario: Draft and ticket boundaries
- **WHEN** the administrator changes an unpublished draft or chooses a ticket
- **THEN** public content changes only at publication, and an author cannot override the charged price or payment verification through a display field.

### Requirement: Author marketing content through a portable agent skill
The project SHALL provide a portable skill that a browser-capable coding agent can use with a manager's authorized Academy editor session. It SHALL guide the agent through page creation, block placement, image selection, formatted text, review and the requested draft or publication outcome.

#### Scenario: Prepare a reviewable draft
- **WHEN** a manager asks for a new page or changes to an existing page for review
- **THEN** the agent uses the supplied environment or staging by default, preserves other content, saves the draft, and returns a verified editor link with its publication state.

#### Scenario: Publish an approved revision
- **WHEN** the manager requests publication to a specific environment
- **THEN** the agent verifies that the draft being published is within that authorization, publishes through the editor, and checks the public page on that environment.

#### Scenario: Respect editor boundaries
- **WHEN** an agent lacks an authorized editor session, encounters a conflicting revision, or cannot represent a requested change using the available controls
- **THEN** it identifies the blocker and preserves the operator's work and existing access boundaries.

### Requirement: Install the visual editor skill from staging
Staging SHALL provide a public installation page with a single cross-platform terminal command and a manual ZIP download containing the canonical visual editor skill. Downloading the skill SHALL require neither a repository checkout nor an Academy account.

#### Scenario: Install on a manager's machine
- **WHEN** the manager runs the advertised command with a supported Node.js and npm installation
- **THEN** the skill is installed for the current user's Codex and Claude Code, or only the agent explicitly selected, and starting an agent session makes it available to invoke.

#### Scenario: Repeat or update safely
- **WHEN** a manager installs again or installs a newer release
- **THEN** matching files remain usable, managed files can be updated, and local edits are reported and preserved.

#### Scenario: Download the same skill across application releases
- **WHEN** someone follows the staging download link or uses a previously published versioned CLI URL after an application update
- **THEN** the download remains available, the CLI version retains its original bytes, and using the installed skill to edit a page still requires the usual editor session and privileges.

### Requirement: Publish staging pages to production from the editor

The production editor SHALL let an administrator review published staging pages that are new on production or differ from it, and publish a chosen page to production. The staging editor SHALL hand a published page over to that production confirmation. Staging SHALL NOT receive production credentials, and a sync SHALL NOT change either environment's payment configuration.

#### Scenario: Review differences before syncing

- **WHEN** an administrator opens **Зміни зі staging** in the production editor
- **THEN** it lists each new or changed staging page with its changed blocks, the photos to copy, any production draft that publication would replace and any ticket that will sell through production checkout, and it reports how many pages already match.

#### Scenario: Publish a staging page to production

- **WHEN** the administrator confirms publication of a listed page
- **THEN** its photos are copied into the production marketing project, its staging image and link addresses become production addresses, the page passes production validation and becomes publicly visible on production, and the list no longer shows it as different.

#### Scenario: Start from the staging editor

- **WHEN** an administrator chooses **Опублікувати на проді** for a published staging page without unsaved changes or an unpublished draft
- **THEN** the production editor opens that page's confirmation, under the administrator's production session, and nothing is published until they confirm there.

#### Scenario: Content changes after review

- **WHEN** the staging page or the production page has changed since the list was loaded
- **THEN** the sync stops with a conflict and nothing is published, and the refreshed list shows the current difference.

#### Scenario: Keep payment settings per environment

- **WHEN** a workshop page bound to a ticket is synced
- **THEN** production sells the ticket through its own live WayForPay checkout, staging stays in mock payment mode, and synced content containing payment provider or staging addresses is rejected.

#### Scenario: Deny sync outside production administration

- **WHEN** a signed-out user, a non-administrator, a staging installation or an unconfigured editor requests the sync list or a sync
- **THEN** the request is refused without reading or writing production content, and production pages that exist only on production are never deleted.

### Requirement: Manage staging content from the production admin

When it holds a dedicated staging marketing writer, the production editor SHALL let an administrator choose Staging or Prod for each page. Reading, saving, publishing, page creation, photo upload and the photo library SHALL act only on the chosen environment's marketing project. Content SHALL reach production from staging only through the confirmed sync. Staging SHALL NOT receive production credentials, and payment configuration SHALL stay per environment.

#### Scenario: Publish a page to staging from the production admin

- **WHEN** an administrator edits a page with Staging selected, saves and publishes it
- **THEN** the staging site shows the new version, the production page is unchanged, and photos uploaded meanwhile are stored in the staging marketing project.

#### Scenario: Promote a staging page to production

- **WHEN** the administrator publishes the staging version to Prod and confirms
- **THEN** the existing sync copies its photos, rewrites staging addresses and publishes it on production; staging keeps mock payments and production keeps live WayForPay.

#### Scenario: Staging target is unavailable

- **WHEN** the production runtime lacks the staging writer, the writer is shared with another credential, or the request comes from a non-production installation or a non-administrator
- **THEN** the Staging switch is not offered, staging requests are refused, and the production editor keeps working on production content.

#### Scenario: Unreleased staging features

- **WHEN** an administrator opens the staging editor
- **THEN** it keeps working against the staging project and shows a link to the same page in the main production admin.

### Requirement: Browse pages in a grouped list with live preview

The editor's page list SHALL group pages by site section and show each page's state, and on production its state on both environments. Selecting a page SHALL show its address, type, states, last change, actions and a live preview without opening the editor.

#### Scenario: Find a page and see what needs attention

- **WHEN** an administrator opens Сторінки сайту
- **THEN** pages appear under their site sections with a state for each environment: published, saved draft, different from staging or only on staging, and search filters the list by title or address.

#### Scenario: Preview a page in either environment

- **WHEN** the administrator selects a page and switches between Комп’ютер and Телефон, Чернетка and Опубліковано, or Staging and Prod
- **THEN** the preview renders that version with the site's templates, purchase controls stay inert, and nothing is saved or published.

#### Scenario: Use the list on a phone

- **WHEN** the list is used at phone width
- **THEN** the list appears first, selecting a page shows its details full width with a way back, and no content overflows horizontally.
