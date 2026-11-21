## ADDED Requirements

### Requirement: Preserve the initial editorial publication
Public Academy marketing pages and their editor SHALL share page content whose initial values reproduce the existing copy, photography and approved presentation.

#### Scenario: First installation
- **WHEN** the editor is initialized against the current content
- **THEN** existing page paths preserve their text, responsive artwork, ordering and actions before any editorial changes are published.

#### Scenario: A published image is replaced
- **WHEN** a manager publishes a photograph and its alternative text
- **THEN** the matching public slot renders the new image while unrelated page content and sales behavior retain their values.
