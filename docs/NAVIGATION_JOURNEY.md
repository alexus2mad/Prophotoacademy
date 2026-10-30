# Academy navigation journey

Verified locally on 30 October 2026. This change preserves the existing homepage composition, six direction cards, photography, catalog cards, program content and commercial rules.

## Destination mapping

| Surface | Before | Now |
| --- | --- | --- |
| Homepage «Курси» | Unfiltered `/courses` | `/courses?category=course`, selected from authored `Program.category` |
| Homepage «Воркшопи» | Unfiltered `/courses` | «Дізнатися про наступні воркшопи» inquiry, subject `workshops`, source `homepage-card` |
| Homepage «Навчання» / «Офлайн програми» | Unfiltered `/courses` | «Усі програми» → `/courses` |
| Individual training card | `/individual-training` | Unchanged; contextual inquiry only if the authored record is absent |
| Corporate training card | `/corporate-training` | Unchanged; contextual inquiry only if the authored record is absent |
| ProPhoto camp card | Camp dialog, title absent from saved inquiry | Camp dialog with persisted subject `camp`, source `homepage-card`, and canonical Ukrainian subject title |
| Hero «Обрати навчання» | Scroll to `#courses` | «Обрати програму» → `/courses` |
| Hero Academy wordmark | Scroll to `#courses` | `/courses`; the original public `#courses` anchor remains valid |
| Public header catalog action | «Усі програми» / «Обрати курс» | «Обрати програму» → `/courses` |
| Catalog header action | Reload catalog | «Допоможіть обрати» inquiry, subject `program-selection`, source `header` |
| Desktop navigation | Student work and Academy, plus catalog CTA | Core destinations shared with mobile/footer: programs, student work, Academy, contacts; the CTA serves as the programs entry except on the catalog itself |
| Mobile navigation | Independently assembled links | Same four core destinations, account as secondary utility, primary CTA outside menu |
| Footer navigation | Same destinations in a different order, no current-page state | Shared core destinations and current-page indication; reviews and ecosystem links retained |
| Gallery/review action row | Student work and all reviews | Both retained, with compact «Обрати програму» → `/courses` |

Studio and Shop retain their existing destinations and positions. Accessible labels identify the separate sites and existing new-tab links. At compact desktop widths, the secondary header ecosystem switch is hidden to keep core links and actions on one line; it remains available in the existing hero/footer and mobile menu.

## Catalog and inquiry contracts

- `category=course` selects the three authored courses, preserving the supplied program order. Hybrid courses remain hybrid; this is not an offline filter.
- The compact «Усі програми / Курси» link control makes the selected category visible. Clearing removes only `category`, retaining attribution and other query parameters. Unknown categories show all programs.
- Query selection works on direct entry, refresh, Back/Forward and the GitHub Pages base path. Suspense retains a server-rendered catalog fallback. The card-motion controller waits for this boundary to hydrate before changing card attributes; the older photography controller respects card ownership even while streamed content is outside its themed shell.
- Each homepage card has exactly one semantic link or button and one tab stop. Existing stretched hit areas, hover/focus behavior and photography motion remain intact.
- Optional inquiry `subject` and `source` are validated enums. The server derives `subjectTitle`; client-supplied titles are rejected. All three fields persist in existing inquiry and delivery-queue JSON, with no database migration.
- Existing program/package IDs, acquisition data, submission handling and unchecked marketing consent remain intact. General inquiries explain help choosing a program without promising timing or a free consultation.

## Content limits

The repository contains three courses, individual and corporate training, and one archived Content Day dated 26 September 2026. It has no confirmed upcoming workshop or camp inventory and no fully offline category. Workshop and camp inquiries therefore request information; they do not claim enrollment or availability. Dates and offerings need authored content before those cards can lead to upcoming events.

## Verification

- Architecture and TypeScript checks passed; formatting and `git diff --check` passed.
- Full test suite: 43 files, 311 tests passed. Coverage includes exact category selection, ordering, URL cleanup, semantic card actions, inquiry persistence/outbox context, consent defaults, invalid-context rejection, hydration-safe motion and unchanged Hub photography behavior.
- Production build passed using installed Node.js. The initial package-manager launch failed to start a Turbopack worker; using explicit Node.js resolved it without changing application code or build configuration.
- Synthetic GitHub review export passed; 53 pages validated for prefixed assets, review notices, noindex and absence of private endpoints.
- Browser checks at 1440, 1024, 390 and 360px: core navigation, category/reset/history/refresh, direct links, existing homepage anchor, individual/corporate destinations, gallery continuation, mobile dismissal, keyboard dialog opening/Escape/focus return, unchecked consent and no horizontal overflow.
- Local production and static review filtered pages produced no browser errors. Review inquiry submission remains disabled. No real inquiries or emails were sent.
- Screenshots and build/test logs are local ignored artifacts in `.data/navigation-journey/`. No deployment is part of this change.

## Changed files

- Guidance: `ARCHITECTURE.md`, `docs/NAVIGATION_JOURNEY.md`
- Shared navigation: `src/lib/navigation/academy.ts`; `Header/{Header.tsx,hooks.tsx}`; `Footer/{Footer.tsx,hooks.tsx}`; `EcosystemNav/EcosystemNav.tsx`; `src/app/academy-ui.css`
- Homepage: `src/lib/academy-home/{selectors.ts,types.tsx}`; `AcademyDirectionCard/AcademyDirectionCard.tsx`; `AcademyDesignHero/AcademyDesignHero.tsx`; `AcademyDesignVoices/AcademyDesignVoices.tsx`
- Catalog: `src/lib/catalog/{selectors.ts,types.tsx}`; `CatalogTemplate/CatalogTemplate.tsx`; `CatalogResults/{CatalogResults.tsx,CatalogResults.module.css,types.tsx}`; `ProgramCatalog/{ProgramCatalog.tsx,hooks.tsx,types.tsx}`; `src/components/behaviors/{CardMotion,PhotographyMotion}/hooks.tsx`
- Inquiry flow: `src/lib/inquiries/{types.tsx,schema.ts,presentation.ts}`; `src/app/api/inquiries/route.ts`; `InquiryButton/{InquiryButton.tsx,types.tsx}`; `InquiryDialog/{InquiryDialog.tsx,hooks.tsx}`; `Consultation/Consultation.tsx`
- Tests: `tests/academy-home.test.ts`, `tests/catalog-navigation.test.ts`, `tests/customer-flow.test.ts`, `tests/direction-card-motion/hooks.test.ts`, `tests/photography-motion/hooks.test.ts`

Component names above use their existing Atomic Design folders under `src/components/{molecules,organisms,templates}`.
