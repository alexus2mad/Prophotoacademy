# media-production Specification

## Purpose

Maintain the Academy's source-owned visual assets and promotional video compositions as reproducible editorial outputs.

## Requirements

### Requirement: Web imagery
The image preparation workflow SHALL produce the renditions used by the approved surfaces from their documented sources.

#### Scenario: A responsive editorial image is replaced
- **WHEN** a responsive editorial image is replaced
- **THEN** the relevant size, crop and visual quality are checked at its intended viewport before acceptance.

### Requirement: Promotional compositions
Each checked-in film SHALL keep its own composition, media preparation workflow and render entry point.

#### Scenario: A contributor changes a sequence in either Academy film
- **WHEN** a contributor changes a sequence in either Academy film
- **THEN** they use that film's scoped guidance, preview the intended timing and verify the rendered media independently of the Academy website release.

### Requirement: Social artwork
The social artwork workflow SHALL expose public share-card files for visual review and detect stale outputs before an application or Pages build.

#### Scenario: The artwork source or a generated image changes without a matching reviewed generation
- **WHEN** the artwork source or a generated image changes without a matching reviewed generation
- **THEN** the existing social artwork check reports the mismatch.
