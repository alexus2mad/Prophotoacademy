## Context

The app renders a saved page inside a same-origin, script-disabled iframe. The existing inspector owns field state and revision-aware mutations. Reusing that boundary preserves the public layout and provides a real desktop and phone preview.

## Decisions

1. Identify visible fields against the saved document on frame load. Use stable section and field identifiers for repeated content, exact matching for unambiguous fields and explicit inspector controls for values that have no editable visual target. Avoid modifying a price, navigation item or neighboring field through a coincidental match.
2. Let text edits share the inspector's unsaved page state. Support keyboard focus, plain-text paste, single-line and multiline values, and Escape to undo an active edit. Keep the editing position steady as the parent state changes.
3. Use the existing validated upload service and a file chooser for the selected image. Updates appear in the canvas and inspector together. Cancellation and rejected files preserve the current image. Image descriptions remain editable in the inspector.
4. Keep saving and publishing explicit. Public content changes only on authorized publication. Only a writable editor exposes editing affordances. Preserve link and form containment inside the managed preview.
5. Make the canvas the first workspace on phones, with fields reachable by a labeled control. Desktop keeps both views.

## Verification

Exercise real clicks, typing, paste, cancellation, file replacement and the save/publish boundary in an isolated writable environment. Compare public rendering and check read-only behavior. Staging uses its configured adapter, with production outside this release.
