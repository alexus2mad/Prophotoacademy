# Working with OpenSpec

OpenSpec is mandatory for every repository change, by people and agents alike, including subagents and delegated tasks. The rule and its scope boundary are in [AGENTS.md](../../AGENTS.md). Every agent instruction file (`AGENTS.md` and `CLAUDE.md` at any depth, Copilot instructions, `.claude/agents/*.md` and `.codex/agents/*.toml`) restates it. `node scripts/openspec/check-agent-rules.mjs`, part of `pnpm spec:check`, fails when one omits the mandate or the link to the root workflow.

From the repository root, use Node 22.20.0 or newer and pnpm 11.25.0. `pnpm spec` runs the pinned OpenSpec 2.1.1 CLI through the package-manager cache. Its first run needs registry access. Use this prefix wherever an upstream skill shows the bare `openspec` executable.

## Find the behavior

```sh
pnpm spec list --specs
pnpm spec show public-programs --type spec
pnpm spec list
```

The [coverage index](../../openspec/coverage.json) maps application and tooling entry points to capability owners and evidence. Read the [public experience](public.md), [learning, commerce and integrations](platform.md) or [editorial, review and operations](operations.md) index for tests, source paths and known discrepancies. The initial inventory is anchored at `0fee3bd99847`.

## Make a change

1. Reuse an active change for related work. Otherwise run `pnpm spec new change <id>`. Inspect `pnpm spec status --change <id>` and `pnpm spec instructions proposal --change <id>`. Use the corresponding instructions for specs, design and tasks.
2. Record the request, boundaries and acceptance criteria before editing. Put deltas under the change's `specs/<capability>/spec.md`. Use SHALL and a WHEN/THEN scenario for each requirement. A behavior-preserving change can declare `skip_specs: true` in its metadata and explain the reason in its proposal.
3. Run `pnpm spec validate <id> --strict --no-interactive`. Apply the tasks, exercise their scenarios and check off completed work. Update the coverage index for changed entry points.
4. Commit each significant verified change with a trailer after a blank line, for example `git commit -m "Align the ticket price" -m "OpenSpec-Change: align-ticket-price"`. A squash commit carrying implementation needs its own trailer.
5. Run `pnpm spec:check` and the relevant application checks. Inspect archive merge findings, including informational diagnostics. Archive with `pnpm spec archive <id> --yes` (use `--skip-specs` for an explicitly declared zero-delta change). Inspect the resulting main specs, rerun `pnpm spec:check` and commit the archive with the same trailer.

Spec validation checks the documents. The tests or direct observations named in each change establish whether implementation meets the scenarios. The [architecture contract](../../ARCHITECTURE.md) and scoped agent instructions govern implementation.

## Agent tools and GitHub

Codex uses `$openspec-propose` and `$openspec-apply-change`. Claude Code and Copilot use `/openspec-propose` and `/openspec-apply-change`. Explicit proposal requests end with the proposal. For an explicit implementation request, use the CLI to prepare any missing artifacts and apply the agreed scope. Ask when a material decision remains. Keep project policy in `AGENTS.md` and `openspec/config.yaml`; generated skills are upstream files.

The GitHub workflow validates current specs, active changes, archived tasks, entry-point coverage and commit references on pushes and pull requests. Reproduce the history check with `node scripts/openspec/check-links.mjs <base> <head>`. Each nonempty post-adoption implementation commit resolves its trailer against the active or archived proposal in that revision. Clean history-only merges carry the checked work. Commits resolving conflicts or integrating pre-adoption work need their own reference. Direct pushes receive a result after GitHub accepts them. Branch protection is administered separately.

To upgrade, change the exact version in the package script, refresh the core skills with `pnpm spec init --scope project --profile core --tools codex,claude,github-copilot --no-animation`, review the generated diff and run the checks. Store Windows-portable skill files so Linux candidates can archive regular files. [Project setup](https://openspec.dev/docs/setup) · [CLI reference](https://openspec.dev/docs/cli)
