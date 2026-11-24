## 0. Sync fix

- [x] 0.1 Copy staging photos from authenticated raw originals and verify their SHA-1 before upload; test the raw request, a re-encoded copy, a mismatched asset ID and a missing staging writer.

## 1. Release

- [ ] 1.1 Build the fixed revision for staging and production, pass the loopback candidate checks and activate it; verify unchanged runtime, payment, notification and nginx digests, health and HTTPS checks.
- [ ] 1.2 Publish /flash-without-fear from the production admin's staging sync after explicit confirmation; verify the public page, both prices and both live checkout actions without buying.
- [ ] 1.3 Prune production to the release plus rollback `0ebadc7`, clean the candidate, record the release and archive.
