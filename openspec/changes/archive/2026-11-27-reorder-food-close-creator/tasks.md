## 1. Course order, date, archive and recorded closure

- [x] 1.1 Put Food first in the Studio course order and primary course setting; move its start to 2026-12-17.
- [x] 1.2 Show «Доступно в записі» for every closed course in place of «Набір закрито».
- [x] 1.3 Add the program archive flag, leave archived programs out of public lists, the sitemap, the review export and editor seeds, return 404 for their pages, and archive Content Creator with a temporary redirect to the homepage.
- [x] 1.4 Update tests and run format, architecture, typecheck, spec checks and the test suite. All 855 tests, TypeScript, architecture, spec checks and changed-file formatting passed.

## 2. Release

- [x] 2.1 At the owner's request, build and activate on production first through the existing isolated-builder flow, verifying the loopback candidate and the public site. Production runs `83fd33e52eaa3a0cf3378575c18d9d09989dd2e7`; the candidate and public checks passed.
- [x] 2.2 Build and activate the same revision on staging and verify it. Staging runs the same revision in mock payment mode; the candidate and public checks passed.
- [x] 2.3 Retain exactly the active and previous verified release per environment and record the release. `8330a97` was pruned from both; `ee092c4` is the rollback. See `docs/releases/2026-11-27-food-first-creator-archive.md`.
