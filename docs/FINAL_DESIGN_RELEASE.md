# Final design staging release — 10 November 2026

Staging runs application commit `73c97ffca507291a6c381c040a169bb718403401`
at <https://staging.prophotoacademy.com.ua>, with
`NEXT_PUBLIC_ACADEMY_DESIGN=studio`. The previous verified release is
`d5c3fb87216758f57dc9dd8f98801a2c82cea33b`. Guarded staging cleanup removed
`d4cdd895a3f52dedac7b2614e8c47a825a3dd296`; exactly active and rollback remain.

The public presentation includes the Figma homepage and its three destinations,
Academy, AI artwork, Studio, Shop, contacts, catalog and program pages. The
artifact supplies missing layouts and interactions. White text on red primary
actions is the owner's explicit exception. The executable `legacy` variant
remains available for a separately built future comparison; no random visitor
assignment or production rollout was introduced.

## Source fidelity and verification

See [implementation decisions](FINAL_DESIGN_IMPLEMENTATION.md),
[source differences](FIGMA_ARTIFACT_DIFFERENCES.md) and
[visual verification limits](FINAL_DESIGN_VERIFICATION.md). Source font/geometry
inconsistencies and preserved functional/business content are explicitly recorded;
this release does not claim unconditional two-pixel conformity.

- Architecture, TypeScript, changed-source formatting and all 336 tests in 49
  files passed. The Windows production build and 57-page synthetic review export
  passed; GitHub Pages itself was not republished.
- The isolated Linux Webpack build passed compilation, TypeScript and generation
  of 65 static pages. Both builder and destination are x86-64 with compatible
  Ubuntu/glibc and Node installations.
- All 261 read-only live checks passed: public routes, staging noindex, catalog
  filters, current package eligibility/prices, mock checkout, static assets,
  fonts, image optimization, private-route denial and both environments' health.
- Desktop/mobile browser checks confirmed homepage tabs, Academy navigation,
  mobile menu dismissal, inquiry scroll lock, Escape/focus restoration, white
  on red controls and the 7,500 UAH Visual Content BASE mock checkout. No browser
  errors or page overflow appeared in the checked 1440/390 views. Local review
  additionally covers 360/768/1024 as detailed in the verification record.
- The existing Commercial Content intake started on 6 November and has no
  `openAfterStart` permission. Its closed checkout, visible prices and inquiry
  actions are correct under the existing date policy. Tests use the server's
  current time and the authoritative eligibility function; no availability was
  changed to satisfy an outdated test expectation.

Private operational evidence and screenshots are in ignored
`.data/final-design/`, including `staging-smoke.json`,
`staging-enrollment-check.md`, `deployment-audit.json`, and the
`staging-{home-desktop,home-mobile,academy-desktop,inquiry-mobile,menu-mobile,catalog-mobile,checkout-mobile}.png`
screenshots. No order, inquiry, email, account or student-progress mutation was
submitted by the verification tools. The existing scheduled email worker ran
normally and reported success after activation.

## Build provenance and activation

The owner explicitly authorized the retired OVH host as a temporary isolated
builder. Only committed source and reviewed public build settings were uploaded;
runtime credentials stayed on Hetzner. The build had no access to old application
configuration or backup paths and did not start an old application or worker.
Its initial 2,200 MB memory cap caused swapping; the one transient unit was raised
to 2,700 MB RAM/2,048 MB swap after checking available host capacity. Application
and backup service settings were unchanged. All temporary source, dependency,
artifact and transfer files were removed after successful staging verification.

| Input/output | SHA-256 |
| --- | --- |
| Committed source archive | `3f14e6b483af8258e438d0000a0b0bae304079d91d5665daeb9008346e90863c` |
| Reviewed public build settings | `7a4c41c23c8cfa8e5c6034a954f37afea24fbb524236d5547ae245bfaefe4605` |
| Final Linux runtime artifact | `ea15ba969c9321b1aa06cbada8afc9ecf5db64aa068d58a949cf5f5a0a61248f` |

Independent review caught an omitted runtime email entry point before activation.
The final artifact was repackaged with `deploy/deliver-email.mjs`, verified
byte-for-byte against the same application source archive. Commit `354a1ff`
corrects future builder packaging and validation; it changes no application code.
Checksums matched on transfer. The worker file exists in the active release and
its next scheduled run succeeded.

Activation used the staging guard and a wrapper restoring both the captured
release and configuration on any failure, including service-restart failure.
Only `NEXT_PUBLIC_ACADEMY_DESIGN` changed in staging runtime configuration; a
root-only backup remains at
`/etc/prophotoacademy-staging/runtime.env.before-73c97ffca507291a6c381c040a169bb718403401`.
Staging stays on its own Supabase/Sanity projects with mock payments.

Production remains on `5ae3eca80dbb9e8eb1bb1203343be16d99ba591a`; its process
(PID 1047), release target and runtime-file checksum were unchanged. No production,
ps-booking, DNS, mail-forwarding or database/CMS changes were made.
