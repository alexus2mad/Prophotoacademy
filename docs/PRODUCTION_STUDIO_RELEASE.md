# Studio identity — production release

Released on 11 November 2026 to <https://prophotoacademy.com.ua>.

- Active application: `c2331bd743e609e48caff40d6a527faadb0ef59d`
- Previous verified rollback: `5ae3eca80dbb9e8eb1bb1203343be16d99ba591a`
- Source branch: `codex/photographic-editorial`
- Staging remains `2bf9515a1667e40bdadf95caea2dc0ec60b28072`, in mock mode

## Customer behavior

The reviewed Studio identity now serves production. Its legacy presentation is
retained for future explicit A/B testing. Public Studio/Shop links go to
`prophotohub.com.ua` and `prophotoshop.com.ua`; booking actions use Hub's `/booking`.
Internal `/photo-studio` and `/shop` design previews remain implemented, unlinked,
excluded from the sitemap and noindex.

All nine packages across the three configured courses are closed to new purchases
in every payment mode. Food Photography remains inquiry-only. Course pages and
direct checkout URLs show “Набір закрито” and offer a next-intake inquiry. Prices,
package identifiers, student grants, lessons, progress and prior orders remain.
Verified payments for already-issued orders still process normally.

AI Artwork appears first under Academy → Workshops. Its approved 22 November
2026, 11:00–16:00 Kyiv event sells offline tickets for 3,900 UAH and online tickets
for 3,000 UAH through production WayForPay. These tickets do not grant course
access. Other archived or inquiry-only offers were not activated.

The existing Make.com → Telegram flow is preserved: checkout queues
`payment_start`; verified payment queues `payment_success`, with the original
customer/product payload and stable event identifiers. Existing merchant,
webhook, callbacks, email settings and cashbox ownership are unchanged. Tests
verify local event deduplication and stable retry keys, not downstream Telegram
exactly-once delivery after an ambiguous network timeout. No real test charge or
synthetic production notification was submitted during verification.

## Deployment boundaries

A fresh Linux artifact was built using production-only public settings on the
previously authorized isolated builder. No runtime credentials or private
teaching content were uploaded there. No database migration or staging data copy
was needed. A temporary candidate on loopback 3142 passed checks before the
production symlink was switched.

Only three runtime keys changed: `NEXT_PUBLIC_ACADEMY_DESIGN=studio` and the two
invitation settings, explicitly sourced from the existing production Resend
credential/sender. This enables the promoted invitation feature without copying
staging credentials, changing notification modes or queuing historical mail.
Production keeps `PAYMENT_MODE=wayforpay`; its Make webhook is preserved exactly.
Nginx, service definitions, other runtime values and staging's process/configuration
were verified unchanged. Email timers remain active with successful worker results.

| Provenance | SHA-256 |
| --- | --- |
| Committed source archive | `75a4e8a22349ed062d8c708de30354d8660c54537d75f3c8755b4a14d7f76f7c` |
| Production public build settings | `233fa52075a4cc108814b213412bb610902e35dc8f2c426ca26a1257beb99fa3` |
| Linux artifact | `ab32c1a5400dc883eb54a22c6a281a1760081695c16793403e1b68b8b5978baf` |
| Activated runtime configuration | `f00a21b4abed50ef28a566cd7a021246d927f72115590f2c2b9c4e6f5a59e00e` |

## Verification and evidence

- Architecture: 697 modules; TypeScript and changed-file formatting passed
- Full test suite: 525 tests across 70 files, including course closure, legacy
  pending payments, both AI ticket formats and Make delivery retries
- Independent application and deployment-helper reviews found no blockers
- Linux production build: 65 pages; synthetic review export: 58 validated pages
- Private candidate and production HTTPS checks: 492/492 each, covering all nine
  closed course checkout URLs, both live ticket forms, links, indexing, private
  route denial, database health, styles, fonts, scripts and photographs
- Browser checks at 390px and 1440px verified course closure, next-intake inquiry,
  mobile navigation, production ticket checkout, white-on-red payment controls
  and the live homepage. No purchase form was submitted

The first local review build stalled under sandbox restrictions and was stopped
by its verified process identity; the permitted retry passed. Repository-wide
format checking also reports existing formatting debt outside the changed files;
the scoped check passed. GitHub Pages was validated, not republished.

Private evidence is under `.data/studio-production/`: `candidate-smoke.json`,
`production-smoke.json`, `activation.log`, `deployed-verification.json`, build
logs, and `production-*.png` screenshots. Release scripts are private operator
artifacts, not application code.

## Retention and rollback

Keep exactly the active production release and `5ae3eca`; obsolete `aa6f6aa` is
removed after live checks. Disposable builder and transfer artifacts are removed.
Private assets, databases and staging releases are not part of cleanup.

Root-only provenance and the complete prior runtime remain under
`/etc/prophotoacademy/studio-promotion/`, prefixed with the active SHA. Rollback
must restore both the prior runtime and release link. The reviewed
`activate-production.py` helper supports a read-only `--rollback` plan and an
explicit `--rollback --apply`, with the full application SHA, artifact checksum
and public-settings checksum above. It refuses concurrent configuration changes.
Do not restore only the link and leave production's design setting inconsistent.

Documentation commits after the release do not change the active application SHA.
