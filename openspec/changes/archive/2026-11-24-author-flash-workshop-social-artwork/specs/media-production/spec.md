## ADDED Requirements

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
