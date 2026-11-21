# content-management Specification

## Purpose

Keep public editorial content, previews and migrations reproducible across the Academy fixture and Sanity environments.

## Requirements

### Requirement: Explicit editorial source
Public content SHALL come from the configured fixture or published Sanity dataset.

#### Scenario: A deployment selects Sanity without a project, dataset or populated Academy and Hub content
- **WHEN** a deployment selects Sanity without a project, dataset or populated Academy and Hub content
- **THEN** the content request reports the configuration or content failure rather than presenting a successful fixture response.

### Requirement: Editorial preview
Authorized editors SHALL be able to preview drafts in the same site origin.

#### Scenario: A valid preview URL targets an allowed same-origin destination
- **WHEN** a valid preview URL targets an allowed same-origin destination
- **THEN** the server enables draft mode and reads draft content without the published-content cache.

#### Scenario: A preview token is invalid or its return URL leaves the allowed site paths
- **WHEN** a preview token is invalid or its return URL leaves the allowed site paths
- **THEN** the request is rejected before enabling preview.

#### Scenario: An editor exits preview
- **WHEN** the editor posts to the disable endpoint from the same origin
- **THEN** the server clears draft mode and redirects home; a cross-origin request receives a forbidden response.

### Requirement: Repeatable migration
The public content importer SHALL expose a dry run before writing and preserve existing editor-owned documents on repeated import.

#### Scenario: The migration runs without its write option
- **WHEN** the migration runs without its write option
- **THEN** it generates a local import manifest for review without uploading assets or writing CMS documents.

#### Scenario: A writer repeats an authorized import
- **WHEN** a writer repeats an authorized import
- **THEN** stable document identities permit existing documents to be preserved.

### Requirement: Media provenance
Published editorial images SHALL preserve usable dimensions, crop or focal intent and available attribution.

#### Scenario: An editor supplies a cropped Sanity image and hotspot
- **WHEN** an editor supplies a cropped Sanity image and hotspot
- **THEN** the public content reader derives display dimensions and a focal position using the cropped image.

### Requirement: Preserve the initial editorial publication
Public Academy marketing pages and their editor SHALL share page content whose initial values reproduce the existing copy, photography and approved presentation.

#### Scenario: First installation
- **WHEN** the editor is initialized against the current content
- **THEN** existing page paths preserve their text, responsive artwork, ordering and actions before any editorial changes are published.

#### Scenario: A published image is replaced
- **WHEN** a manager publishes a photograph and its alternative text
- **THEN** the matching public slot renders the new image while unrelated page content and sales behavior retain their values.
