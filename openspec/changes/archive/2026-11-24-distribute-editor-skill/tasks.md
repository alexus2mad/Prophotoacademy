## Implementation

- [x] Package the canonical editor skill reproducibly as a manual download and versioned command.
- [x] Implement safe installation for both agents and document installation in Ukrainian.
- [x] Configure a staging-only public download location with a reversible static release.

## Verification

- [x] Verify archive contents, checksums, installation targets, repeat installation and conflict handling.
- [x] Publish on staging and test the advertised command with an empty user profile and no checkout.
- [x] Validate OpenSpec, architecture and types and record release evidence.

The public 1.0.0 release returned the expected bytes for all four files. A clean Windows user profile and npm cache installed both agents through the published URL and verified the canonical file bytes. Repeating the command reported both installations current. Nine installer tests, the archive reproducibility check and four Linux publisher tests passed. The installer page was checked at 320, 390 and 1440 pixels and with enlarged text. Production and staging application health checks passed after the staging static release.
