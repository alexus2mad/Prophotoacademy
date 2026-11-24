# Working on ProPhoto Academy

Start at the repository root. Every change has an OpenSpec ID and an observable acceptance condition. Read the applicable [capability specs](openspec/specs/), [coverage index](openspec/coverage.json), and scoped instructions before editing. The [contributor guide](docs/openspec/README.md) gives commands, evidence and examples.

## From request to verified change

1. Find the existing change with `pnpm spec list` and the existing capability with `pnpm spec list --specs`. Read its full scenarios, the affected routes and tests. Open a named change for new work or update the relevant active change.
2. Record the requested outcome, the scope and the acceptance criteria before editing implementation. Describe observable behavior in the delta, technical choices in the design and verification in the tasks. For an internal change that preserves specified behavior, explain the reason and set `skip_specs: true` in its change metadata.
3. Respond to the request as given. For exploration or an explicitly requested proposal, stop after that deliverable. For an explicit implementation request with settled scope, use the CLI to prepare or reuse the artifacts and proceed through the tasks. A material ambiguity about behavior, business terms, design or release scope goes back to the user.
4. Keep the implementation within scope. A request to change a price background does not authorize adding purchase buttons. Follow approved Figma frames and the explicit [designer resolutions](docs/FIGMA_ARTIFACT_DIFFERENCES.md), then use the artifact for missing layouts and interactions. Record conflicts and their resolution. Retain source photography and attribution.
5. Verify scenarios with the relevant tests or direct observation. Run `pnpm spec:check`, architecture, type checks and applicable formatting/tests. Structural application changes also require the full suite, production build, validated Pages export and affected desktop/mobile interactions. Keep credentials, customer records, private course materials and generated output out of Git.
6. Commit each significant verified change with a Git trailer `OpenSpec-Change: <id>`. Preserve unrelated work. Archive only when the tasks and scenarios are verified; recheck the canonical specs and archive afterward.

## Project contracts

- For a new page’s Open Graph artwork, follow the [social card design and authoring guide](docs/SOCIAL_PREVIEWS.md). Inspect the wide and square compositions before releasing them.
- For requests to create or edit marketing pages in the visual admin, follow the [ProPhoto editor skill](.agents/skills/prophoto-editor/SKILL.md). It covers the shared draft, responsive preview and publication workflow.
- [ARCHITECTURE.md](ARCHITECTURE.md) owns Atomic Design, semantic HTML, KISS and SOLID. Keep one component in its own folder/file, contracts in colocated `types.tsx`, hooks in `hooks.tsx`, domain decisions outside UI and client boundaries small. Preserve keyboard access, visible focus, responsive behavior and reduced motion.
- [Studio implementation](docs/FINAL_DESIGN_IMPLEMENTATION.md) and the [public evidence index](docs/openspec/public.md) identify the active design. Keep Studio and legacy explicitly selectable, their business policies shared, and their styles scoped. Preserve the flagship emphasis, early pricing, separate brand journeys, white primary CTA text on red, original design typography, and existing rules for titles, arrows and decorative numbering. Keep source-approved content counts in their owning design decisions.
- [Lesson authoring](docs/LESSON_AUTHORING.md) governs instructional content. Preserve Source Sans 3, shared semantic prose, accessible tables and preview parity. Course completion is server-graded and quiz-only. Preserve earned passes across retries and revisions; bookmarks and player preferences are separate.
- [Course checkout](docs/COURSE_CHECKOUT.md) owns payment modes and purchase access. The server validates available packages and amounts. Mock purchases grant no access; explicit disabled mode grants configured test access without financial effects; live fulfillment requires verified payment. Preserve revocation boundaries.
- [Platform ownership](docs/PS_BOOKING_BOUNDARY.md) assigns Academy student administration, access, privileges and statistics to Academy. The booking customer card displays Academy records; shared cashbox operations belong to ps-booking. Keep authorization on the server.
- [Hosting](docs/HOSTING.md) and [deployment](docs/PRODUCTION_DEPLOYMENT.md) govern releases. Deliver authorized synced fixes from one verified source revision using separate staging and production settings. Preserve mock staging, live production, the validated synthetic Pages review and the standalone staging social gallery. After smoke checks, use guarded release cleanup to retain the active release and one verified rollback.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
