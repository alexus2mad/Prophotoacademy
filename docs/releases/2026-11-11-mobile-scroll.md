# Mobile homepage scroll performance — 11 November 2026

Status: deployed to production at approximately 21:52 UTC on 11 November 2026
(23:52 Europe/Kyiv). Source verification, production build, candidate checks,
live checks and guarded cleanup passed.

## Change

The homepage exposure scene now owns its animation state. It updates the adjacent
directions section through an explicit element reference and CSS properties,
avoiding React updates across the hero and card grid on every scroll frame.
Mobile exposure backgrounds use opacity layers. The mobile timeline ignores
browser-toolbar height changes during a gesture, while real layout changes and
restored pages refresh its measurements.

Card motion batches shared clipping-ancestor measurements, skips ancestors of
offscreen cards and ignores unrelated nested scroll events. Header contrast
observes explicit tone changes instead of every inline style update. Native
scrolling and the existing card zoom remain part of the interaction.

This release also includes the already-built
[Shop Instagram destination change](2026-11-11-shop-instagram.md), which was not
activated separately. No payment, notification, access, learning-progress,
database or runtime-configuration changes are included.

## Source and verification

- Mobile fix: `538e07126e3de2c31028b6e9aa5086e8bb552c64`
- Included Shop change: `66ba251c8c33c3ee529e8c2e22ac4c1320306fa5`
- Previous verified production release: `7ee2628d942029937aad2e6e45f47504eb8d8921`
- Linux artifact SHA-256:
  `538eb20fbbd47659c633f2f6d02a3ce48a1a3d32e24816fa533d78f7189c2637`
- TypeScript passed
- Architecture passed: 708 modules
- Changed TypeScript, test and CSS files passed Prettier
- The additional `ARCHITECTURE.md` formatting warning was resolved; its final
  formatting check passed
- Initial full suite: 570 passed, one sandbox HTTP test blocked by local
  loopback permissions (`EACCES` on `127.0.0.1:3219`)
- The sandbox test file passed all four tests with loopback access enabled
- Full-suite rerun with loopback access: 571 tests passed across 71 files
- Synthetic GitHub Pages export and validation passed: 58 routes
- Local browser review at 390px verified forward/reverse mobile exposure and
  horizontal card-rail swiping; at 1440px the desktop title and exposure meter
  remained present. This is interaction verification, not a measured FPS claim
- Combined Linux production build passed; transferred artifact hashes matched
- Read-only candidate checks passed: 550/550 business and exact Shop-link checks,
  plus 2,276/2,276 social checks across 20 routes, four crawler identities and
  66 image variants

Private build, test and cleanup logs are saved under
`.data/mobile-scroll-release/`. Candidate social verification is saved at
`.data/social-release/mobile-candidate-social.json`.

## Production release

Production destination: <https://prophotoacademy.com.ua/>. Application source
`538e07126e3de2c31028b6e9aa5086e8bb552c64` is live; the documentation commit is
separate. Public build settings and runtime configuration remained byte-identical.
Staging's application release, process and runtime were unchanged. No real
purchase, email or Telegram message was sent for validation.

| Check                                                      | Observed result                                        |
| ---------------------------------------------------------- | ------------------------------------------------------ |
| Combined Linux production build and artifact verification  | Passed                                                 |
| Candidate Shop links, business and social checks           | Passed                                                 |
| Activation time and running SHA                            | Approximately 21:52 UTC; `538e071`                     |
| Live mobile scrolling, exposure and card interactions      | Passed at 390px                                        |
| Production Shop links and business checks                  | 550/550 passed                                         |
| Production social checks                                   | 2,276/2,276 passed                                     |
| Runtime and public build settings unchanged                | Verified byte-identical                                |
| Staging application release, process and runtime unchanged | Verified                                               |
| Exactly active release plus `7ee2628` retained             | Verified; obsolete `c2331bd` removed                   |
| Isolated builder cleanup                                   | Passed: two build trees and 16 guarded files removed   |
| Production transfer cleanup                                | Two artifact copies removed; rollback records retained |

Live browser review at 390px verified forward and reverse exposure transitions,
header contrast and horizontal card swiping. Screenshot:
`.data/mobile-scroll-release/production-mobile.png`. This records observed
interactions, not measured FPS. Production verification recorded PID `133080`
and systemd invocation `aaf29b8105964c998618f00ad41c10bb`.

The separate staging social-gallery request may add a staging-only nginx route
after these production guards. It is outside this application release; the
unchanged staging claim above applies to its application release, process and
runtime, not to that subsequent routing task.

Builder cleanup verified exact artifact and helper hashes, inactive units,
canonical paths and absence of processes using the candidate trees before
removal. It removed the combined `538e071` build and unused `66ba251` build,
including their root-owned input/output files. Audit helpers remain. Operator
upload copies under `/home/ubuntu/shop-release-upload/` and
`/home/ubuntu/mobile-scroll-release-upload/`, plus `mobile-scroll-deployed.py`,
remain outside the guarded cleanup scope. No application release or service on
the builder was changed.

This release does not claim another social-app cache refresh.
