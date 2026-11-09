# Final design verification — 10 November 2026

The `studio` marketing variant is selectable at build time. `legacy` remains
executable and is the default. Production activation is outside this release.
Figma wins source conflicts; see [the difference register](FIGMA_ARTIFACT_DIFFERENCES.md).

## Browser evidence

Local screenshots and detailed measurements are retained in the ignored
`.data/final-design/` audit folder, including `home-qa.md`, `implementation/`,
`contacts-mobile.jpg`, `contacts-drawer-desktop.jpg`, `menu-mobile.jpg`, and
`qa-{checkout-desktop,checkout-mobile,comparison-mobile,inquiry-mobile}.jpg`.
No student records or private lesson content are part of these screenshots.

- Homepage section boundaries at 1440 content pixels differ from Figma by at
  most 1.66 px through the inquiry section. At 390 content pixels the measured
  boundaries through inquiry differ by under 1 px. This is section geometry,
  not an all-glyph pixel-diff certification.
- All three homepage states, manual keyboard tab activation, review expansion,
  carousel arrows, keyboard navigation and mobile dots were exercised.
- Academy, intensive, Studio, Shop and catalog were checked at 1440 and 390
  content pixels. Gallery movement/end states, equipment selection, contextual
  inquiry, curriculum disclosures and six/all-to-three/course catalog queries
  worked without document horizontal overflow.
- Homepage and contacts also passed overflow checks at 360, 768 and 1024 pixels.
- The course BASE action reached the correct package and price in mock checkout;
  required-field validation, mobile comparison package selection, Escape and
  focus return were checked. No purchase or real inquiry was submitted.
- Inquiry controls retained their labels, consent and honeypot. Empty submission
  focuses the first invalid input. Drawers lock background scrolling and restore
  focus and scrolling on Escape. Shop selection updates the submitted topic.
- Source image URLs resolve locally and in the repository-prefixed review;
  mobile picture sources use the same prefix boundary.

The browser has a classic 15 px scrollbar. Reference measurements use 1440/390
**content** pixels; full-page screenshots may normalize scrollbar dimensions.
Keep this distinction when comparing screenshots to exported Figma frames.

## Deliberate limits

The documented Figma font/geometry inconsistency, retained privacy consent,
verified business data and extra account destination produce differences beyond
2 px in affected layouts. They are explicitly recorded, not concealed by font
distortion, clipped content or false offers. No unconditional 2 px certification
is claimed. OS-level reduced-motion emulation and 200% text-only enlargement
were not exercised; reduced-motion rules and responsive wrapping were reviewed.

## Automated checks

Architecture and TypeScript pass. The complete suite passes all 336 tests across
49 files, including the new design selector/asset-prefix tests. The local production Webpack build succeeds;
the synthetic review export validates 57 pages, prefixed assets, noindex notices
and exclusion of private routes.

The repository-wide formatting check reports pre-existing style differences in
untouched files. Changed source files are formatted; the legacy implementation
is not broadly reformatted as part of this design variant.

Staging activation, health checks and release retention are recorded in
[the final design release](FINAL_DESIGN_RELEASE.md). Production is unchanged.
