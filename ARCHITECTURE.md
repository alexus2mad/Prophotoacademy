# Application architecture

ProPhoto uses Atomic Design for its presentation layer. Business rules, content transport, payments, persistence and routing keep their own responsibilities outside that hierarchy. Refactoring must preserve the reviewed customer journeys and visual design.

## Composition

| Layer     | Responsibility                                                                    | Examples                                                                       |
| --------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Atoms     | A useful primitive with a stable semantic contract                                | Button, IconButton, Input, FieldError, Photo, BrandLogo                        |
| Molecules | A small functional group                                                          | FormField, Dialog, Disclosure, CourseCard, PackageCard, WorkCard, RoomCard     |
| Organisms | A complete section or interaction                                                 | Header, InquiryDialog, ProgramPackages, Gallery, AcademyHero, HubSpaces        |
| Templates | Arrange sections into a layout                                                    | SiteShell, AcademyHomeTemplate, ProgramTemplate, CatalogTemplate, RoomTemplate |
| Pages     | Resolve route input, fetch content, metadata, availability and not-found behavior | Next.js `src/app/**/page.tsx` and layouts                                      |

An organism may compose another organism. Dependencies may point to the same or a lower UI layer; they must not point upward or form runtime cycles. A lower component must not borrow an upper component's props type. Use a domain contract or move the shared contract to the lowest appropriate owner.

`src/components/behaviors` contains cross-cutting, nonvisual controllers for photography motion, editorial reveals and consented measurement. They are deliberately outside the visual hierarchy. They return no visual markup and keep React behavior in their own hooks.

Horizontal browsing rails retain native touch, trackpad and keyboard scrolling. The opt-in `HorizontalRail` controller adds primary-mouse dragging only when content overflows, distinguishes dragging from clicking and preserves card actions. The partner strip drives autoplay through that same native scroll position; do not combine a transformed marquee with manual scrolling. Pause autoplay during interaction, offscreen/hidden states and reduced motion, and resume from the visitor's position.

The partner strip renders only enough identical copies to cover its viewport plus
one repeat, recalculated on resize. Never append copies as time passes. Desktop
and mobile autoplay share the same loop. Individual marks from the shared artwork
sit on a common centerline with the same gap between marks and across repeats.
Pointer presses and horizontal scrolling
pause it until three seconds after the gesture and native momentum settle, then
speed eases back in over one second. Autoplay scroll events must not restart that
idle timer. Deliberate keyboard focus stays paused; passive desktop hover does
not. Duplicate strips are hidden from assistive technology. The exposure title remains intact
and fades as one heading after the exposure midpoint; do not restore word morphs
or geometry-measuring text layers.

Student-work browsing rails explicitly opt into cancellable mouse inertia and
free desktop scrolling. Keep native touch scrolling and mobile snap behavior.
Arrows, keyboard navigation and a new gesture cancel momentum immediately.
Dragging must not open an image dialog, while ordinary clicks still do. Do not
enable inertia globally on logos, navigation rails, or static image grids.

Scroll animation state stays inside its owning section, not the homepage composition.
Share continuous visual progress through explicit element references and CSS properties;
avoid re-rendering unrelated heroes or card grids on each frame. Batch geometry reads,
skip offscreen card ancestors, and ignore nested scroll events from unrelated rails.
Header contrast observes explicit `data-header-tone` changes rather than all inline
styles. Mobile exposure backgrounds use opacity layers so the approved transition
does not repaint entire sections; keep native scrolling and the existing card zoom.

Atomic Design is a mental model, not a requirement to wrap every HTML element. Use native elements directly when extraction adds no stable responsibility. A small unique route may compose molecules directly; major layouts use templates. Classification follows the component's purpose and dependencies rather than its size.

## Component ownership

```text
src/components/organisms/InquiryDialog/
  InquiryDialog.tsx   # One named component; presentation and UI composition
  types.tsx           # Props and local type contracts; type-only imports
  hooks.tsx           # Cohesive state, effects and interaction workflows
```

- Component folders and files use the same PascalCase name. Import the concrete file, such as `@/components/molecules/FormField/FormField`.
- Keep one component per file. Extract named rendering helpers into their own component folders rather than hiding JSX in callbacks such as `renderTable`.
- Project-authored aliases, interfaces, props, states and structural type annotations belong in the nearest owning `types.tsx`. Domain contracts live in `src/lib/<domain>/types.tsx`; route contracts live in `src/app/types.tsx`. Script, CMS and test contracts follow the same convention.
- Use `import type` for contracts. Type files contain no executable implementation or React dependency just to justify the `.tsx` extension. Do not create empty type files, re-export every contract centrally or duplicate inferred SDK/schema models.
- Built-in React and navigation hooks and custom hook implementations belong in `hooks.tsx`. Components call their colocated custom hook. Shared behavior can be composed from another owner's `hooks.tsx`, as native dialog controllers do.
- Hooks own state and side effects, not JSX. Pure calculations stay in `selectors.ts` or ordinary helpers; do not name them hooks. Infer hook return types unless an explicit public contract is useful.
- Simple click handlers can remain with presentation when they contain no stateful workflow. A one-line event dispatch does not justify a custom hook.
- Add `helpers.ts`, colocated styles or tests only when needed. Do not introduce empty scaffolding or broad barrel exports.

## Semantic HTML, KISS and SOLID

Use a link for navigation and a button for an action. Specify `type="submit"` only for form submission; the shared Button defaults to `button`. IconButton requires an accessible name. Preserve labels, heading hierarchy, list semantics, keyboard behavior and error associations. Use native `dialog` and `details` for their focus, keyboard and disclosure semantics. Preserve reduced-motion behavior and visible focus.

Keep responsibilities explicit: routes retrieve content; selectors derive display decisions; components present data; hooks coordinate browser state; server services validate and persist purchases. Components take the data they actually render. For example, CourseCard receives a program, its offering and its photograph, not the entire CMS payload.

Apply SOLID through small contracts and composition. Extend an interface through meaningful children or focused components rather than accumulating mode flags. Keep business policies independent of React. Depend on explicit data contracts at rendering boundaries. Introduce an adapter or interface when an external integration needs a stable boundary; do not create factories, inheritance hierarchies or abstractions without a concrete use.

KISS means clear names, readable control flow and the smallest implementation that meets the requirement. It does not mean hiding validation, accessibility or error handling. Prefer straightforward functions over generic frameworks, duplicated mutable state or clever shortcuts. Keep rendering pure; perform browser effects and network mutations in the appropriate hooks or server handlers.

## Academy visual identity

The public route group selects an explicit presentation with `academyDesign()`
(`NEXT_PUBLIC_ACADEMY_DESIGN=legacy|studio`, default `legacy`). Both remain
executable; they share content, metadata, inquiries, checkout and enrollment
services. Studio components and `.academy-studio` styles are isolated from the
legacy shell, Hub, learning workspaces and Sanity. No visitor assignment or
runtime cookie experiment is enabled. Changing the public environment value
requires rebuilding. See [final design implementation](docs/FINAL_DESIGN_IMPLEMENTATION.md)
and [source difference register](docs/FIGMA_ARTIFACT_DIFFERENCES.md).

The Studio shell uses Figma's KyivType Sans, Roboto Condensed and Marck Script.
The explicit 10 November designer resolutions in the source difference register
override the general Figma-first rule. Shared secondary hero metrics follow the
artifact; inquiry sections use paper backgrounds and white-on-red primary CTAs.
`studioAcademyCourses` orders the four source-backed main courses without
changing offering eligibility. Courses without configured offers remain
inquiry-only. Academy and homepage reviews share attributed records, with
eleven on Academy, with eight initially on the homepage and all eleven after
expanding “Усі відгуки”.
Its original assets are local, deduplicated and mapped by source frame in
`src/lib/studio-design/assets.json`; provenance has no temporary download URLs.
The source-backed destinations `/academy`, `/photo-studio`, `/shop` and
`/ai-artwork` never replace `/studio` (the Sanity editor). Studio inquiry forms
and the legacy dialog compose one `useInquirySubmission` workflow, preserving
server validation, attribution, consent and review-mode restrictions.

Brand navigation uses `ecosystemPages` for the Academy-hosted `/photo-studio`
and `/shop` introductions. Header, menu and footer links open these pages;
room links target their corresponding Studio sections. Booking and shopping
CTAs use `ecosystemDestinations` for the public Hub booking page and Shop
Instagram profile. Do not route visitors directly to the booking embed.
The homepage starts on Academy and its Studio/Academy/Shop tabs switch the
scene only on explicit click or keyboard activation. Do not add automatic
brand cycling or swipe-to-change behavior. Academy may rotate its portraits
within the selected Academy scene. Preserve the Studio panorama, eased photo
motion and the outgoing image pose until its crossfade finishes. Scroll state
remains owned by the exposure section, separate from the mode selection.
The Academy fixture's Shop setting mirrors the external destination for the
retained legacy design. Studio and Shop remain excluded from the sitemap and
marked noindex as introductions to the separate businesses. Course sales can be
explicitly `closed` in the offering model; presentation and all checkout modes
share this policy. Closing sales never changes existing student access or rejects
verified callbacks for already-issued orders. Product tickets retain the existing
WayForPay and Make/Telegram outbox flow.

Both designs share one learning index at `/academy`: the approved Figma Academy
frame in Studio and the original filterable catalog in legacy. Use
`studioAcademyDestinations` for Studio's overview and course-section links.
Shared account, checkout, inquiry and utility surfaces use `academyProgramsHref()`.
The old `/courses` URL permanently redirects to `/academy` in both designs,
preserving query parameters and mapping `category=course` to `#courses` in Studio.
The synthetic Pages export renders the same selected design at the compatibility
URL with `/academy` as canonical and noindex. Do not reintroduce a competing
navigation destination.

Academy public and workspace shells explicitly apply the shared `academyThemeClassName` from `src/lib/typography/fonts.ts`. `academy-theme.css` owns neutral brand tokens, shared controls and opt-in card motion; public, lesson and authoring styles own their respective layouts. Do not apply the Academy palette or font aliases globally: Hub and Sanity Studio are excluded. Preserve the homepage composition and Source Sans 3 instructional typography. See [Academy design system](docs/ACADEMY_DESIGN_SYSTEM.md) for dimensions, motion, feedback colors and verification.

## Next.js and the two build modes

Public sharing metadata is owned by `src/lib/social-images`, with page-specific
static JPEGs under `public/social`. The offline generator and authored artwork
plan live in `scripts/social-images`; no rendering library enters the client
bundle. Private route families use constant, non-personal previews. All public
pages share the same metadata helper in both presentation variants. Production
and review prebuilds validate artwork provenance, dimensions and size; the
review validator checks actual social asset URLs. See
[social previews](docs/SOCIAL_PREVIEWS.md). Preserve the default crawler list
when extending blocking metadata for messaging apps.

Root metadata owns the shared ProPhoto favicon. The SVG preserves the two symbol paths from `public/brand/prophoto-study-trimmed.svg`, rendered white on black; the ICO contains 16, 32 and 48px variants, and the Apple icon is 180px. Explicit icon URLs stay under `/brand/` so the review exporter prefixes them correctly. `public/favicon.ico` also serves browsers' conventional fallback request. The review validator checks icon links and their exported files.

Read the applicable bundled Next.js documentation before changing framework behavior. Server Components remain the default. Put `use client` at the real interactive boundary; do not mark whole templates client merely because they contain an interactive child. Serializable props cross server/client boundaries.

UI components do not import the server-only content transport, `next/headers`, Node APIs or Sanity clients. Routes call `getContent`; pure image, offering, catalog and program selectors live in their domain folders. Payment, inquiry, attribution and booking validation remain server responsibilities.

The GitHub review uses the same components and hooks. The live catalog renders per request and its server fallback preserves the requested category and query parameters. The static review retains a full-grid fallback. `ProgramCatalog` reads `category=course` through `useSearchParams` inside `Suspense`, so the same metadata-based selection, clearing links and browser history work in production and static review. `CatalogResults` preserves the supplied program ordering and existing card presentation; unknown categories show all programs. `ReviewBooking` reads static-page queries after hydration and reuses the production studio booking presentation. A serialized Kyiv-date snapshot keeps the initial catalog render consistent across hydration; the client refreshes it after mounting. The exporter changes only framework entry points and unavailable server actions. It must not embed a separate UI implementation in build-script strings. Its root layout is adapted with a TypeScript AST so formatting changes do not break publication.

Public offer descriptions use the authored `Program.equipmentDescription`, `deliveryDescription` and `Package.comparison` facts from the existing content source. Missing comparison evidence is unconfirmed, not included or excluded. `programSchedule` is the shared presentation policy for catalog, program introduction, packages and checkout. `Offering.learningState` describes confirmed delivery; `openAfterStart` remains a sales-eligibility flag. Presentation metadata never grants access or changes purchase authorization. See [Stage 2 offer rules](docs/STAGE2_OFFERS.md) and [source evidence](docs/STAGE2_OFFER_EVIDENCE.md).

## Administration and cashbox ownership

The Academy admin owns student management (moved from `ps-booking` on 17 October 2026, at the owner's request): `/admin/students` (overview, progress per course, meetings with attendance rosters, search), `/admin/students/[email]` (grants, lesson progress, purchases; grant/upgrade/extend/migrate/revoke/restore through `AccessDialog`) and `/admin/team` (administrator delegation). Pages call `src/lib/admin` queries; mutations go through `/api/admin/{access,team,attendance}` and `/api/admin/roster`, each behind `requireAdmin`. Administrator changes require `requireAdmin(true)`: an email code confirmed within ten minutes (`/login?reauth=1`). Course authoring, package definitions, media, Zoom scheduling, promo codes and configuration stay in the same admin. Legacy `/operations` redirects to `/admin/students`; its shared-token customer API returns 410.

The Academy database remains the authoritative identity, entitlement and progress store, beside the protected learning services. Do not create a second editable copy of student accounts in booking. Booking keeps a read-only Academy panel in its customer card (`customer.summary`) and the original management commands behind `/api/academy/*`, forwarding them server-to-server to `/api/integrations/ps-booking`; its management page redirects to the Academy admin. Each request uses HMAC over timestamp, single-use nonce and exact body, plus an opaque credential for a verified administrator. Booking stores that credential encrypted and exposes only its own HttpOnly session cookie. Every request checks the current immutable user ID and role; privilege changes require fresh verification. This boundary replaces browser operations tokens without sharing cookies across origins.

`alexus2mad/ps-booking` owns the shared cashbox, merchant-wide WayForPay imports, product classification, reporting and financial operations. Academy links to that application's authenticated cashbox; it must not add a competing finance dashboard, transaction-list scheduler or refund submission API. Account privileges in Academy do not confer access to the booking application's manager session.

Academy owns its checkout orders, verified purchase receipts, fulfillment events and learning entitlements. Its existing WayForPay callback remains the immediate fulfillment boundary. A successful browser return never grants access. Full, confirmed refunds revoke only the related purchase grant; partial refunds preserve access. Do not infer a purchase or entitlement from product names, a booking or an aggregate revenue report.

The explicitly configured `PAYMENT_MODE=disabled` rollout enrolls published, mapped packages without charging. `src/lib/commerce/enrollment.ts` writes zero-amount test orders, grants, audit and email jobs atomically, without payment events or transactions. Missing payment keys never enable this mode. Exact retries cannot duplicate access; a new test order cannot renew or restore an earlier grant. See `docs/COURSE_CHECKOUT.md`. The local sandbox also supports this enrollment path while blocking payment callbacks and email dispatch.

The management bridge is not a payment-event feed. The existing booking cashbox still has no Academy payment-event producer or refund-submission endpoint. Any financial reconciliation integration belongs in that repository. See `docs/PS_BOOKING_BOUNDARY.md` and `docs/LEARNING_OPERATIONS.md` for setup and activation requirements.

Administrator-created access and privileges queue invitation email atomically with the change. Delivery rechecks current access, while identity activation still requires the recipient's verified email login. Resends are rate-limited and never mutate rights. The shared admin notice distinguishes queued/provider-accepted email from account verification. See [invitation operations](docs/INVITATIONS.md) for isolated staging credentials and worker configuration.

## Private learning content

`src/lib/learning` owns entitlement, authoring, media and completion policies. `src/lib/admin` owns protected management commands and read models used by booking; it is not an Academy management UI. Domain services never depend on presentation components. Public Sanity marketing content is separate from the verified-private learning dataset. Published curricula are immutable and grants retain their assigned release. PDFs/images use a verified-private Storage bucket; Mux uses signed playback. Media URLs are issued only after authorization and expire; files already downloaded cannot be recalled.

The static review uses only `/demo` records and shared presentation components. It excludes real API, learning, account-management and authoring routes. Never place real student records, tokens or paid lesson material in demo data.

`LessonBody` shares the editorial reading layout between the player and saved-draft preview. Quiz authoring and grading policies live in `src/lib/learning`: answer keys stay out of student payloads, and authenticated submissions use the existing idempotent progress transaction. Every published lesson ends with one quiz; server-graded passes alone complete lessons. Navigation stays unrestricted. See `docs/LESSON_AUTHORING.md`. File downloads reauthorize and mint a fresh private URL at click time, so a long reading session cannot leave a stale download link.

`CourseEditor` composes the `CourseOutline` and one focused `LessonBlockEditor`. The block editor is an organism because it composes protected media players through `EditorMediaPreview`; metadata disclosures and material selection remain molecules. Media previews use administrator authorization and no-op progress callbacks. Pure immutable draft updates live in `src/lib/learning/editor.ts`, keeping asynchronous uploads from replacing unrelated edits.

## Verification

The local learning sandbox lives in `scripts/sandbox`. It generates an isolated copy of the app and substitutes only infrastructure boundaries. Its persisted synthetic records stay under `.data/learning-sandbox`; its generated source stays under `.learning-sandbox`. Neither belongs in production or the GitHub review. Never add a production test-login branch, disable live payments for a rehearsal, or point sandbox management links at production. See `docs/LEARNING_SANDBOX.md`.

Run `pnpm architecture:check`, `pnpm typecheck` and `pnpm test`. Build the production app and the static review when composition, routing or build adapters change. Check the affected journeys in the browser, including mobile, keyboard access, dialogs, package comparison, gallery navigation and disabled review submissions.

The architecture guard enforces folder ownership, type placement, hook placement, layer dependencies, server boundaries and runtime cycles. Its tests check invalid arrangements as well as allowed compositions. It cannot prove semantic HTML, KISS, SOLID, good names or appropriate abstraction: those remain review responsibilities.

Commit each verified significant change. Keep source changes separate from the generated `gh-pages` branch. Do not commit credentials, local customer records or generated build directories.

## References

- [Brad Frost: Atomic Design methodology](https://atomicdesign.bradfrost.com/chapter-2/)
- [React: Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React: Components and hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
