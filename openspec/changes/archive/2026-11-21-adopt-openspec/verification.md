# Adoption verification

Checked against a clean worktree at application baseline `0fee3bd99847`. The inventory covers 231 entry points and 17 capabilities. The public, platform and operations indexes record source evidence, test evidence and the unresolved product discrepancies.

| Check | Result |
| --- | --- |
| OpenSpec 2.1.1 and project skills | Confirmed local project root and standard schema. Six skills installed for Codex, Claude Code and Copilot. Validated the complete delta and coverage before archive. |
| Disposable CLI rehearsal | Created and archived a valid synthetic change. Strict validation failed for a missing scenario and an unfinished archived task, then passed for the corrected cases. A behavior-preserving change with the explicit skip setting archived successfully. |
| Git and inventory regression checks | All eleven tests passed. Includes direct push, new branch, diverged PR, squash, active/archive resolution, legacy and conflict merges, missing or invalid trailers, unmapped and stale entries. |
| Application | Architecture guard passed for 763 modules. TypeScript passed. All 677 Vitest tests passed across 79 files using three workers and loopback access for the local sandbox. Fixture validation passed. |
| Python deployment checks | Five passed on Windows. Six POSIX-specific cleanup cases were skipped by their existing platform guard. |
| Formatting | All new workflow scripts and the GitHub workflow passed Prettier. The repository-wide default check flags 798 existing CRLF checkouts under Windows `core.autocrlf=true`; the same check allowing local line endings reported zero differences. |

The adoption does not change a product route, application dependency, database schema or build adapter. No application release, live transaction or third-party notification was necessary to verify it.
