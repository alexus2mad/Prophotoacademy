# Academy identity rollout verification

Local review: 27 October 2026. This presentation rollout does not deploy staging, production or GitHub Pages, and does not change data schemas or service contracts.

## Scope reviewed

The approved homepage identity now applies through one explicit Academy theme to public pages, conversion pages, accounts, lessons and administration. The homepage composition is retained. Hub and the embedded Sanity Studio are outside this theme.

The visual checks cover 23 routes at 360, 390, 768, 1024 and 1440px: 115 viewport checks without document-level horizontal overflow. Routes include the homepage, Hub, catalog, program, About, reviews, contacts, student work, privacy policy, login, synthetic checkout, student dashboard/purchases/settings, lesson player, course editor, students, student detail, team, promo codes, admin settings and Academy/Hub not-found states.

Screenshots and machine-readable viewport results are saved locally in `.data/academy-redesign/`. They use public content and synthetic demo records, and are excluded from Git.

## Interaction evidence

- Catalog category, format and experience filters retain their query parameters; reset restores all six existing programs.
- At 390 × 844, the visual-content page exposes its first package price and action before the program photograph. Comparison and inquiry dialogs open, scroll, close with Escape and restore trigger focus. Native empty-field validation remains available.
- Checkout places its compact order summary above the mobile form. Empty submission focuses the name field and does not send an order. The explicit review notice remains visible.
- The student dashboard prioritizes its resume action. A nonexistent meeting no longer creates a placeholder panel; expired-course records remain available.
- The lesson player retains a 64px header, 300px desktop curriculum, mobile drawer and current-lesson chapter links. The chapter link closes the drawer and updates the fragment and current location.
- Lesson reading remains Source Sans 3 at 18px with 30.6px line height. Correct and incorrect quiz responses retain distinct green/red backgrounds, borders and text labels. A failed demo attempt followed by a passing retry updates completion without changing the quiz-only policy.
- Lesson and editor photographs open in the gallery, zoom and advance; Escape closes the overlay. Editor image/video previews remain visible, including the mobile save/publish controls. Access dialogs preserve their action, reason and confirmation controls; no real access was modified.
- Academy fallback pages receive the shared theme; `/hub` fallback pages do not. Homepage screenshots were compared with the pre-change reference.

## Automated checks and limits

Architecture (509 modules), TypeScript, formatting, focused presentation/motion/authentication tests and the full suite (201 tests across 35 files) pass. Production compilation and static review validation also pass. The static validator checks 53 exported pages for prefixed assets, review notices, noindex and absence of private endpoints.

Reduced-motion behavior is covered by the observer tests and scoped CSS. The available browser tool did not apply native 200% browser/text zoom; this is a remaining manual accessibility check, not a claimed pass. Narrow viewport checks and bounded/scrollable content cover responsive reflow separately.

Local authentication is intentionally unconfigured; login's unavailable state and existing authentication tests were checked. Live email delivery, private-media authorization and real checkout were not reconfigured or exercised against customer accounts during this design review. Synthetic routes share the same presentation components.

## Shared content width and simplified catalog — 28 October 2026

Academy page shells now share `--academy-content-max: 1472px`. Public headers and footers, the homepage, workspace headers/layouts, lesson grid and editor are centered within this cap. Reading text, forms, checkout summaries and status panels retain their narrower measures. Hub keeps its own 1360px container; fullscreen galleries and mobile drawers remain viewport overlays.

The catalog now shows all six programs without filters or a result counter. It preserves the configured primary program and CMS order. Legacy filter query parameters no longer hide programs, and the static review uses the same catalog route and template.

Browser checks cover the catalog, homepage, commercial-content program, synthetic student dashboard, lesson and editor at 360, 390, 768, 1024, 1440, 1920 and 2560px. Additional 390/1920px checks cover login, unavailable checkout, About, student work, reviews, contacts, privacy and Hub. No document-level horizontal overflow was observed. Wide Academy shells measure 1472px, the lesson sidebar remains 300px, lesson prose remains 672px at 18px, and collapsed lesson content remains 1100px. The compact checkout status panel measures 640px. Desktop curriculum collapse and the mobile drawer open/close interaction still work.

Evidence is saved in ignored `.data/content-wrapper/`. Synthetic records were used for workspace checks; no live account, order or progress mutation was made. Architecture (502 modules), formatting, TypeScript, all 243 tests, the production build and the validated 53-page synthetic export pass. This verification does not claim native 200% text zoom, which remains the manual check described above. The changes are prepared locally; this verification is not a staging deployment.

## Course-list hierarchy and start dates — 28 October 2026

The six programs now use compact horizontal rows with a smaller photograph, the authored audience and course description, a prominent price, an exact start date and one visible action. Mobile places the date and price beside a 96px thumbnail and keeps the first course action within the checked 390 × 844 viewport. Archived events and bespoke training have distinct non-purchase wording without invented dates or prices.

Verified at 360, 390, 600, 768, 1024, 1440, 1920 and 2560px: no horizontal document overflow, no hidden card content, and actions at least 49px high. Keyboard focus remains visible; Enter on the commercial course opens its existing program page with three packages. An independent design review approved desktop and mobile screenshots. Existing opt-in photo/title motion and reduced-motion styling are retained. Evidence is under ignored `.data/catalog-redesign/`.

Architecture (504 modules), formatting, TypeScript, all 251 tests, the production build and the validated 53-page synthetic export pass. Eight schedule cases cover future and same-day starts, Kyiv day boundaries in summer and winter, past intakes, archived events, bespoke schedules and missing dates. The first parallel full-suite run timed out in four database setup hooks; the complete suite passed with two workers and unchanged assertions/timeouts. No backend, pricing, CMS data or payment behavior changed. This is a local review, not a live deployment.
