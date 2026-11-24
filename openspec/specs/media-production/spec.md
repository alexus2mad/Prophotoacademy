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

### Requirement: Design page-specific social cards
Each photographic page-specific card SHALL use one approved public photograph from or directly representing its subject, full bleed in both a 1200 × 630 landscape composition and a 630 × 630 square composition. The pair SHALL carry the same approved wordmark, headline lines, optional category and short supporting line. The authoring guide SHALL document the palette, type, spacing, crop controls, export commands and review procedure.

#### Scenario: Compose a new marketing page
- **WHEN** a contributor prepares a page for sharing
- **THEN** they can follow the design guide to specify the route, approved photograph, alt text, factual copy and focal point for each format, and generate both variants through the existing catalog.

#### Scenario: Inspect the two crops
- **WHEN** the contributor reviews the pair at publication and compact message-preview sizes
- **THEN** the subject and headline remain recognizable in both, using Roboto Condensed Bold headings, KyivType Sans supporting text, a single wordmark, a red rule and a local dark gradient behind the type. Solid letter strokes meet the renderer’s minimum 4.5:1 contrast. The artwork omits duplicate branding, site URLs, CTA graphics, prices and dates.

#### Scenario: Release the artwork
- **WHEN** the pair passes visual review
- **THEN** both JPEGs are sRGB, at most 300,000 bytes each, served as static files at content-addressed URLs, and old image URLs remain usable by cached previews.
