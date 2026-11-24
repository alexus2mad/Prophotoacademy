## Why

The owner requires spec-driven development with OpenSpec for all work on this repository. Only the root `AGENTS.md` describes the workflow, and its wording reads as guidance. Subagents, scoped instruction files and the nested video projects do not say it is mandatory, so a delegated or narrowly scoped agent can edit without a change.

## What Changes

- The root `AGENTS.md` states that OpenSpec is mandatory for every contributor and agent, including subagents, delegated tasks and unattended sessions. It defines which requests need no change: questions, reviews, explorations and editor-content work that leaves the repository untouched.
- `CLAUDE.md`, `.github/copilot-instructions.md`, the scoped `src/*/AGENTS.md` files, the HyperFrames projects under `videos/` and the project subagent `.claude/agents/ui-image-curator.md` repeat the mandate and point to the root workflow.
- An agent that delegates work passes the change ID and its scenarios to the delegate. A delegate that receives no change stops before editing and asks for one.
- A new check, run by `spec:check`, fails when a tracked agent instruction file omits the mandate.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `spec-driven-development` gains a requirement that every agent instruction entry point binds agents to the workflow.

## Impact

Agent instruction files, `scripts/openspec/`, `package.json#spec:check`, the coverage index and the contributor guide. Application behavior does not change.
