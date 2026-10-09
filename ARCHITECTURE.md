# Application architecture

ProPhoto uses Atomic Design for its presentation layer. Business rules, content transport, payments, persistence and routing keep their own responsibilities outside that hierarchy. Refactoring must preserve the reviewed customer journeys and visual design.

## Composition

| Layer | Responsibility | Examples |
| --- | --- | --- |
| Atoms | A useful primitive with a stable semantic contract | Button, IconButton, Input, FieldError, Photo, BrandLogo |
| Molecules | A small functional group | FormField, Dialog, Disclosure, CourseCard, PackageCard, WorkCard, RoomCard |
| Organisms | A complete section or interaction | Header, InquiryDialog, ProgramPackages, Gallery, AcademyHero, HubSpaces |
| Templates | Arrange sections into a layout | SiteShell, AcademyHomeTemplate, ProgramTemplate, CatalogTemplate, RoomTemplate |
| Pages | Resolve route input, fetch content, metadata, availability and not-found behavior | Next.js `src/app/**/page.tsx` and layouts |

An organism may compose another organism. Dependencies may point to the same or a lower UI layer; they must not point upward or form runtime cycles. A lower component must not borrow an upper component's props type. Use a domain contract or move the shared contract to the lowest appropriate owner.

`src/components/behaviors` contains cross-cutting, nonvisual controllers for photography motion, editorial reveals and consented measurement. They are deliberately outside the visual hierarchy. They return no visual markup and keep React behavior in their own hooks.

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

## Next.js and the two build modes

Read the applicable bundled Next.js documentation before changing framework behavior. Server Components remain the default. Put `use client` at the real interactive boundary; do not mark whole templates client merely because they contain an interactive child. Serializable props cross server/client boundaries.

UI components do not import the server-only content transport, `next/headers`, Node APIs or Sanity clients. Routes call `getContent`; pure image, offering, catalog and program selectors live in their domain folders. Payment, inquiry, attribution and booking validation remain server responsibilities.

The GitHub review uses the same components and hooks. `ReviewCatalog` and `ReviewBooking` read static-page queries after hydration; they reuse the production catalog and studio booking presentation. The exporter changes only framework entry points and unavailable server actions. It must not embed a separate UI implementation in build-script strings. Its root layout is adapted with a TypeScript AST so formatting changes do not break publication.

## Administration and cashbox ownership

`ps-booking` owns the student-management interface: student search, access grants/upgrades/extensions/revocations/restorations, curriculum transfers, student statistics, administrator delegation and Zoom attendance. Academy has no browser routes for those mutations. Its `/admin` routes are limited to course authoring, package definitions, media, Zoom scheduling and configuration. Account menus link directly to booking's management area; legacy `/operations` redirects there and its shared-token customer API returns 410.

The Academy database remains the authoritative identity, entitlement and progress store, beside the protected learning services. Do not create a second editable copy of student accounts in booking. Booking owns authenticated management commands through `/api/academy/*`, forwarding them server-to-server to `/api/integrations/ps-booking`. Each request uses HMAC over timestamp, single-use nonce and exact body, plus an opaque credential for a verified administrator. Booking stores that credential encrypted and exposes only its own HttpOnly session cookie. Every request checks the current immutable user ID and role; privilege changes require fresh verification. This boundary replaces browser operations tokens without sharing cookies across origins.

`alexus2mad/ps-booking` owns the shared cashbox, merchant-wide WayForPay imports, product classification, reporting and financial operations. Academy links to that application's authenticated cashbox; it must not add a competing finance dashboard, transaction-list scheduler or refund submission API. Account privileges in Academy do not confer access to the booking application's manager session.

Academy owns its checkout orders, verified purchase receipts, fulfillment events and learning entitlements. Its existing WayForPay callback remains the immediate fulfillment boundary. A successful browser return never grants access. Full, confirmed refunds revoke only the related purchase grant; partial refunds preserve access. Do not infer a purchase or entitlement from product names, a booking or an aggregate revenue report.

The management bridge is not a payment-event feed. The existing booking cashbox still has no Academy payment-event producer or refund-submission endpoint. Any financial reconciliation integration belongs in that repository. See `docs/PS_BOOKING_BOUNDARY.md` and `docs/LEARNING_OPERATIONS.md` for setup and activation requirements.

## Private learning content

`src/lib/learning` owns entitlement, authoring, media and completion policies. `src/lib/admin` owns protected management commands and read models used by booking; it is not an Academy management UI. Domain services never depend on presentation components. Public Sanity marketing content is separate from the verified-private learning dataset. Published curricula are immutable and grants retain their assigned release. PDFs/images use a verified-private Storage bucket; Mux uses signed playback. Media URLs are issued only after authorization and expire; files already downloaded cannot be recalled.

The static review uses only `/demo` records and shared presentation components. It excludes real API, learning, account-management and authoring routes. Never place real student records, tokens or paid lesson material in demo data.

## Verification

Run `pnpm architecture:check`, `pnpm typecheck` and `pnpm test`. Build the production app and the static review when composition, routing or build adapters change. Check the affected journeys in the browser, including mobile, keyboard access, dialogs, package comparison, gallery navigation and disabled review submissions.

The architecture guard enforces folder ownership, type placement, hook placement, layer dependencies, server boundaries and runtime cycles. Its tests check invalid arrangements as well as allowed compositions. It cannot prove semantic HTML, KISS, SOLID, good names or appropriate abstraction: those remain review responsibilities.

Commit each verified significant change. Keep source changes separate from the generated `gh-pages` branch. Do not commit credentials, local customer records or generated build directories.

## References

- [Brad Frost: Atomic Design methodology](https://atomicdesign.bradfrost.com/chapter-2/)
- [React: Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React: Components and hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
