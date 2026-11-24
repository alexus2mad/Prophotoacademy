# visual-interactions Specification

## Purpose

Preserve the visual and accessible interaction contracts of the Academy's photographic marketing presentation across desktop and mobile.

## Requirements

### Requirement: Studio visual identity

Studio marketing pages SHALL use the approved Studio visual identity, source photography, paper or dark sections and white labels on red primary actions. The marketing theme shall remain scoped to its shell.

#### Scenario: Crossing into a lesson or Hub
- **WHEN** a visitor leaves a Studio marketing page for learning or Hub
- **THEN** the destination retains its own typography. Instructional prose uses its reading system.

### Requirement: Browsing motion and exposure

Photographic browsing motion SHALL respond to hover on pointer devices and the selected in-view card on touch devices. The exposure scene shall progress with native scroll and fade the intact title after the midpoint.

#### Scenario: Moving down the mobile homepage
- **WHEN** different direction cards enter the reading position
- **THEN** their motion is individually selected, and selecting a different homepage brand remains an explicit action.

#### Scenario: Reading the exposure scene
- **WHEN** exposure rises past its midpoint
- **THEN** the title fades as a single heading. Reduced-motion visitors retain access to the scene's content.

### Requirement: Bounded, interactive partner strip

The partner strip SHALL loop on desktop and mobile with bounded repeated content, evenly spaced and vertically centered logos, and a pause for direct interaction.

#### Scenario: Ending a gesture
- **WHEN** a visitor finishes dragging or swiping and native momentum settles
- **THEN** movement resumes from that position after three seconds with a gradual acceleration, provided the strip is visible and motion is enabled.

#### Scenario: Keyboard or reduced motion
- **WHEN** a user deliberately focuses the strip by keyboard or requests reduced motion
- **THEN** automatic movement pauses and manual browsing remains available. Repeated logos are hidden from assistive technology.

### Requirement: Inline work galleries

Student-work galleries SHALL expose selectable images, support native touch browsing, and retain correct positions at both ends of a mobile rail.

#### Scenario: Swiping an overflowing inline rail
- **WHEN** a mobile visitor scrolls through the work
- **THEN** the viewport shows approximately two and a half equal-width items. Items snap at the start until the trailing edge of the last image aligns at the end.

#### Scenario: Dragging a desktop work rail
- **WHEN** a visitor drags an inertial work rail with the primary mouse button
- **THEN** the gesture scrolls the rail without opening the image, and another gesture or a navigation control can interrupt momentum.

### Requirement: Work gallery dialogs

Selecting a work SHALL open its gallery at that image. The dialog shall maintain a stable frame and controls, retain alternative text and expose navigation without visible editorial captions.

#### Scenario: Moving between portrait and landscape work
- **WHEN** a visitor uses an arrow control, keyboard arrow or horizontal swipe
- **THEN** the displayed work and position counter change within the same dialog and its controls stay in place.

#### Scenario: One work
- **WHEN** the dialog contains a single work
- **THEN** previous and next controls are disabled and the visitor can still close the dialog.

### Requirement: Hero photography

The Studio homepage SHALL preserve the outgoing photograph's pan or zoom through its fade and respect motion preferences. Academy images may rotate within their selected brand.

#### Scenario: Switching scenes while the panorama is moving
- **WHEN** the visitor selects another brand while Studio is visible
- **THEN** the outgoing image retains its motion until it finishes fading and the incoming photograph is ready.

#### Scenario: Compact exposure
- **WHEN** a visitor scrolls the compact homepage
- **THEN** the exposure section lightens from black toward paper and displays the exposure meter without the desktop scene photograph.

### Requirement: Steady workshop gallery dragging
An overflowing workshop photo rail SHALL track horizontal dragging continuously and settle without visible jumps or flicker. Selecting a photograph and intentionally dragging the rail SHALL remain distinct interactions.

#### Scenario: Drag and release a photograph
- **WHEN** a visitor presses a photograph and drags the rail horizontally
- **THEN** the photographs follow the gesture and settle without snapping back and forth, and the gesture does not open the dialog.

#### Scenario: Browse or select after dragging
- **WHEN** a visitor next uses a gallery control, swipes, or clicks a photograph
- **THEN** the chosen action works and a deliberate photo click opens the matching photograph.
