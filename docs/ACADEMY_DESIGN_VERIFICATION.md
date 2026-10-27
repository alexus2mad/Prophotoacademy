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
