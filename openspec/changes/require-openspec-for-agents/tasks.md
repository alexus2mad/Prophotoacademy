## 1. Instructions

- [x] 1.1 State the mandate, its scope boundary and the delegation rule in the root `AGENTS.md`; verify by reading the opening section.
- [x] 1.2 Add the mandate line to `CLAUDE.md`, `.github/copilot-instructions.md`, `src/components/AGENTS.md`, `src/lib/AGENTS.md`, both `videos/*/AGENTS.md` and `videos/*/CLAUDE.md`, and the `ui-image-curator` subagent for Claude Code and Codex; verify with the guard.

## 2. Guard

- [x] 2.1 Add `scripts/openspec/check-agent-rules.mjs` with tests for a compliant tree, a missing mandate, a missing root link and ignored copies; verify with `node --test`.
- [x] 2.2 Run the guard from `spec:check` and the OpenSpec workflow tests, map it in `openspec/coverage.json`, and document it in the contributor guide; verify with `spec:check`.

## 3. Verification

- [x] 3.1 Run strict validation of this change, `spec:check`, the OpenSpec script tests and formatting of the touched files; archive after the scenarios are confirmed.

## Verification

- Read the opening of the root `AGENTS.md`: it states the mandate, the no-repository-edit boundary (questions, reviews, explorations, visual-editor page edits) and the delegation rule.
- `node scripts/openspec/check-agent-rules.mjs` verified 11 instruction files: root `AGENTS.md`, `CLAUDE.md`, Copilot instructions, both `src/*/AGENTS.md`, the four HyperFrames `AGENTS.md`/`CLAUDE.md` files and the curator subagent for Claude Code and Codex. Ignored copies under `.pages-build/`, `.data/` and the sandboxes are skipped.
- Its three tests cover a compliant tree, a file without the mandate, a subagent without the root link, a missing root file and an ignored copy. With the existing link and coverage tests, 14 passed.
- Strict validation of this change, all specs and the archive passed; coverage verified 244 entry points across 18 capabilities. Prettier passed on the touched files.
