## ADDED Requirements

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
