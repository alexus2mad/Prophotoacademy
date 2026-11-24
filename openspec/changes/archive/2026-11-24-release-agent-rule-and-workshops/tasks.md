## 1. Preflight

- [x] 1.1 Run typecheck, architecture, the full test suite and the Pages export at the release revision; verify that all pass.
- [x] 1.2 Capture each environment's active and rollback releases and the redacted production runtime, payment and nginx digests; verify they match the recorded contract.

## 2. Staging

- [x] 2.1 Build, transfer and activate the release revision with `academy-activate-staging`; verify health, the noindex header, the editor login redirect and the workshop and food landings over HTTPS, and the editor's handoff link.
- [x] 2.2 Prune staging to the release plus rollback `6f57f41`; verify the release listing.

## 3. Production

- [x] 3.1 Build and transfer the release revision, then pass the loopback candidate checks; verify that production is still on `75b7828`.
- [x] 3.2 Activate it; verify health, unchanged runtime, payment and nginx digests, anonymous editor denial, indexable robots, the workshop and food landings over HTTPS, and a read-only sync list showing the staging-only pages.
- [x] 3.3 Prune production to the release plus rollback `75b7828`; verify the release listing, then clean the temporary candidate files.

## 4. Record

- [x] 4.1 Update `docs/HOSTING.md` and add the release note; validate, archive and commit with the change trailer.

## Verification

Recorded in [the 24 November release note](../../../../docs/releases/2026-11-24-content-sync.md): full suite, architecture, typecheck, OpenSpec checks and Pages export; candidate and live checks on both environments with unchanged runtime, payment and nginx digests; browser checks of the production sync list, confirmation, staging handoff and 390 px layout with every confirmation cancelled.
