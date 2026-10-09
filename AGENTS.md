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

## Required verification and change handling

- Run `pnpm architecture:check`, `pnpm typecheck` and relevant tests. For structural changes, run the full test suite, production build and GitHub review export, then check affected desktop/mobile interactions.
- Use `pnpm format` / `pnpm format:check` for the shared code style. Do not edit generated build output.
- Commit each significant verified change. Preserve other work and keep credentials and customer data out of Git.
- GitHub Pages publishes only the validated static export from `gh-pages`. Production backend actions remain unavailable in that review.
- Student/account management, privilege changes, access administration, attendance and student statistics belong in `ps-booking`'s admin interface. Academy retains authoring and the student experience. Use the authenticated management bridge; do not add duplicate student-admin screens or browser operations tokens. The shared cashbox and merchant-wide financial operations also remain in `ps-booking`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
