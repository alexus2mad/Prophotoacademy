## Context

Codex reads `AGENTS.md` files from the root down to the working folder; Claude Code reads `CLAUDE.md`; Copilot reads `.github/copilot-instructions.md`. Project subagents (`.claude/agents/*.md`, `.codex/agents/*.toml`) start with only their own definition and the caller's prompt, so a root-only rule does not reliably reach them.

## Decisions

- **One wording, every entry point.** Each instruction file carries a short line stating that OpenSpec is mandatory and linking the root `AGENTS.md`. The root file keeps the full workflow, so the line in other files does not need updating when the workflow changes.
- **Scope boundary.** Questions, reviews, explorations and editor-content work through the browser editor change no repository file and need no change. Any repository edit, including documentation, release notes and agent instructions, needs one first. This matches the history check, which requires a trailer on every post-adoption commit with its own changes.
- **Delegation.** The caller passes the change ID and the relevant scenarios. A delegate without a change stops before editing and asks. Read-only delegates are unaffected.
- **Guard.** `scripts/openspec/check-agent-rules.mjs` lists tracked and unignored files the same way the coverage check does. It selects `AGENTS.md` and `CLAUDE.md` at any depth, `.github/copilot-instructions.md`, `.github/instructions/*.md`, `.claude/agents/*.md` and `.codex/agents/*.toml`. Each must contain "OpenSpec" and "mandatory"; files outside the root must also reference `AGENTS.md`. Ignored generated copies (`.pages-build/`, `.data/`, sandboxes) are excluded by the listing. Upstream generated OpenSpec skills are not instruction entry points and are not checked.

## Risks

The HyperFrames `AGENTS.md`/`CLAUDE.md` files come from an upstream template. A regeneration would drop the added line; the guard then reports it.
