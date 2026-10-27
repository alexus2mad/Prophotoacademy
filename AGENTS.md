# ProPhoto development rules

Read [ARCHITECTURE.md](ARCHITECTURE.md) before changing the application. It is the authoritative component and dependency contract.

## Required implementation pattern

- Use semantic HTML, KISS and SOLID: clear names, one responsibility, small interfaces, explicit data dependencies and composition. Avoid speculative abstraction or extraction that adds no useful responsibility.
- UI grows through `src/components/{atoms,molecules,organisms,templates}/ComponentName/ComponentName.tsx`. Next.js route files are the page layer. Nonvisual controllers belong in `components/behaviors`.
- Keep one named component per file. Put project-authored types and structural contracts in colocated `types.tsx`; put React/navigation hooks and custom hook implementations in `hooks.tsx`. Do not create empty files or a universal types/hooks module.
- Types use type-only imports. UI dependencies point sideways or downward, including type contracts. No runtime import cycles or server transports in UI components.
- Keep domain decisions in pure selectors or server services. Pages fetch content; components receive data. Preserve Server Components and use small client boundaries.
- Links navigate; buttons act. Retain explicit submit types, native dialog semantics, labels, keyboard access, focus states, reduced motion and responsive behavior.
- Preserve the approved visual design, flagship course emphasis, early course prices, separate Academy/Hub customer journeys and review-mode restrictions unless the user requests a change.
- Do not add title punctuation, decorative section numbering, excessive arrows or distracting labels. Source images and brand logos remain authoritative.
- All Academy presentation uses the explicitly scoped shared theme and self-hosted Inter/KyivType identity. Keep public composition expressive and workspace controls quiet; preserve semantic quiz/error colors. Do not leak this theme into Hub, ps-booking or Sanity Studio. Follow `docs/ACADEMY_DESIGN_SYSTEM.md`; update owning CSS rather than layering another competing override sheet.
- Lesson content uses the scoped Source Sans 3 reading system and shared `LessonProse` renderer. Keep the editor preview consistent with the player; preserve semantic heading levels, native table headers, keyboard scrolling and user text resizing. Do not apply marketing display type to instructional prose. See `docs/LESSON_AUTHORING.md`.
- Lesson completion is quiz-only: exactly one final quiz per newly published lesson, server grading, durable lesson-level completion preserved across retries and revisions. Never reintroduce reading, scrolling, viewing, attendance or manual-reading credit. Bookmarks and player preferences are independent of completion.

## Required verification and change handling

- Run `pnpm architecture:check`, `pnpm typecheck` and relevant tests. For structural changes, run the full test suite, production build and GitHub review export, then check affected desktop/mobile interactions.
- Use `pnpm format` / `pnpm format:check` for the shared code style. Do not edit generated build output.
- Commit each significant verified change. Preserve other work and keep credentials and customer data out of Git.
- After every successful Academy deployment and smoke check, remove obsolete application releases, keeping exactly the active release and one previous verified release for rollback. Follow `docs/PRODUCTION_DEPLOYMENT.md` and its guarded cleanup command; never delete curriculum versions, teaching assets, database records, runtime configuration or ps-booking releases as part of this cleanup.
- GitHub Pages publishes only the validated static export from `gh-pages`. Production backend actions remain unavailable in that review.
- Enrollment modes are explicit server configuration. `disabled` grants real test access with zero charge and no financial records; `mock` grants no access; `wayforpay` requires verified callbacks. Never infer bypass from missing keys, let the browser choose mode/price/rights, or restore revoked access through checkout. Preserve published package validation and see `docs/COURSE_CHECKOUT.md`.
- Student/account management, privilege changes, access administration, attendance and student statistics live in the Academy admin (`/admin/students`, `/admin/team`), next to authoring, and call the Academy services directly. Since 17 October 2026 `ps-booking` keeps only a read-only Academy panel in its customer card through the signed bridge, and its `/academy.html` redirects here. Do not rebuild student-admin screens in booking or reintroduce browser operations tokens. The shared cashbox and merchant-wide financial operations remain in `ps-booking`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
