## ADDED Requirements

### Requirement: Published editor pages have their own share identity
A published editor-created marketing page SHALL supply its own title and available description to share metadata, use its dedicated image pair when registered, and keep the branded photographic fallback available for pages awaiting artwork.

#### Scenario: Share a published workshop
- **WHEN** a visitor shares a published workshop with reviewed social artwork
- **THEN** the HTML head identifies that workshop and includes its own wide and square Open Graph files in that order and its wide Twitter card, using absolute URLs for the current environment.

#### Scenario: A workshop is unpublished on another environment
- **WHEN** artwork exists for the route but that environment has no published page
- **THEN** the ordinary publication and missing-page rules still apply.
