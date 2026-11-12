# Legacy course referral recovery — 12 November 2026

Staging and production run source commit `8425340e60f0a28ba1d6cc213a8a7df73286d636`.
Both retain `66f5dac437effd6fd754ebec0f6a9d1474689f74` as the single previous
verified release. See the [public backlink inventory](../BACKLINK_RECOVERY_2026.md).

The confirmed old referral `/#education-id` again reaches the homepage's learning
directions in both design variants through native HTML. The legacy `/#courses`
target remains available. No new HTTP redirect was necessary: the checked
historical paths already resolve or return the existing direct 301 to their
replacement. ProPhotoStudy remains active and unchanged.

| Environment | Build ID                | Candidate checks | Live checks |
| ----------- | ----------------------- | ---------------: | ----------: |
| Staging     | `ic9j-bUxc0KgC7bz6si97` |          698/698 |     698/698 |
| Production  | `v13S_UYqfPncj_vKcFFP1` |          699/699 |     699/699 |

Verification covered 650 tests, 727-module architecture validation, TypeScript,
the two Linux production builds and 58 validated synthetic review pages. Native
fragment navigation passed at 390 and 1440 px with JavaScript enabled and disabled
in both designs. The in-app browser also verified the built staging candidate and
the live production journey from the legacy fragment to `/academy#courses`.

The first restricted test run blocked the synthetic sandbox's loopback connection
and exceeded a setup timeout under parallel load. The full suite passed with
loopback permission and two workers. One staging asset fetch initially failed;
a direct recheck returned 200 and the complete live smoke then passed.

Each environment was built with its own public configuration. Runtime files were
verified byte-identical before and after activation. Production retains live
WayForPay, existing notifications, closed course sales and its 16-URL sitemap.
Staging retains mock payments, noindex and its empty sitemap. The separate social
preview gallery remains unchanged. Checks created no orders, messages or student
records, and invoked no background jobs.

Obsolete application releases, temporary builder directories and duplicate
transfer archives were removed after successful verification. Active and rollback
builds, local artifact copies, runtime backups and release journals are retained.
Private operational evidence and screenshots are under
`.data/backlink-release-2026-11-12/` and `.data/backlinks-2026-11-12/`.
