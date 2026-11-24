## ADDED Requirements

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
