## 1. Preflight

- [ ] 1.1 Run typecheck, architecture, the full test suite and the Pages export at the release revision; verify that all pass.
- [ ] 1.2 Capture each environment's active and rollback releases and the redacted production runtime, payment and nginx digests; verify they match the recorded contract.

## 2. Staging

- [ ] 2.1 Build, transfer and activate the release revision with `academy-activate-staging`; verify health, the noindex header, the editor login redirect and the workshop and food landings over HTTPS, and the editor's handoff link.
- [ ] 2.2 Prune staging to the release plus rollback `6f57f41`; verify the release listing.

## 3. Production

- [ ] 3.1 Build and transfer the release revision, then pass the loopback candidate checks; verify that production is still on `75b7828`.
- [ ] 3.2 Activate it; verify health, unchanged runtime, payment and nginx digests, anonymous editor denial, indexable robots, the workshop and food landings over HTTPS, and a read-only sync list showing the staging-only pages.
- [ ] 3.3 Prune production to the release plus rollback `75b7828`; verify the release listing, then clean the temporary candidate files.

## 4. Record

- [ ] 4.1 Update `docs/HOSTING.md` and add the release note; validate, archive and commit with the change trailer.
