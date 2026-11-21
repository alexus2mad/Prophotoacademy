## ADDED Requirements

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
