## ADDED Requirements

### Requirement: Steady workshop gallery dragging
An overflowing workshop photo rail SHALL track horizontal dragging continuously and settle without visible jumps or flicker. Selecting a photograph and intentionally dragging the rail SHALL remain distinct interactions.

#### Scenario: Drag and release a photograph
- **WHEN** a visitor presses a photograph and drags the rail horizontally
- **THEN** the photographs follow the gesture and settle without snapping back and forth, and the gesture does not open the dialog.

#### Scenario: Browse or select after dragging
- **WHEN** a visitor next uses a gallery control, swipes, or clicks a photograph
- **THEN** the chosen action works and a deliberate photo click opens the matching photograph.
