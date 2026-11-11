# ProPhoto Shop Instagram destination — 11 November 2026

Status: implementation, focused verification and the isolated Linux production
build passed. This commit was not independently activated. It shipped with the
[mobile scroll fix](2026-11-11-mobile-scroll.md) in production source `538e071`
at approximately 21:52 UTC on 11 November 2026. Combined build, candidate and live
checks passed. The unused isolated Shop build was cleaned up.

## Change

At the owner's request, active Academy Shop links now use the exact supplied
destination, including its query parameter:

<https://www.instagram.com/prophoto.shop?mdxt=ZnIwcnUzdHp2eGh2>

The shared destination covers the Studio header, menu, footer, homepage hero and
promotional banner. The marketing fixture supplies the same URL to legacy
surfaces. Legacy accessible labels identify Instagram, with the footer also
announcing its new tab. Production continues to use `CONTENT_MODE=fixture`;
this release does not migrate or edit Sanity content.

The retained `/shop` design remains unlinked and noindex for future use. Its
future-domain social artwork remains unchanged. Hub destinations, course-sales
closure, live payments, Telegram purchase notifications, student access and
learning progress are unchanged.

## Source and verification

- Application commit: `66ba251c8c33c3ee529e8c2e22ac4c1320306fa5`
- Retained previous release: `7ee2628d942029937aad2e6e45f47504eb8d8921`
- Source archive SHA-256:
  `e76528ce3af01a7d137dc42471e0a105ebabd8a77a16b6fce0e82bc67b42bfe0`
- Focused tests: 19 passed
- Independent rendered-link verification: 7/7 passed; no blocking findings
- TypeScript and scoped formatting passed
- Architecture: 708 modules passed
- All 66 social-image variants passed validation

The six-file application diff changes only destination configuration, fixture
data, accessible labels, link tests and architecture guidance. It changes no
checkout, payment, entitlement, progress or API implementation.

## Combined production release

Production destination: <https://prophotoacademy.com.ua/>. Public build settings
and runtime configuration remained byte-identical. Staging's application release,
process and runtime remained unchanged. A separately requested staging-only
social-gallery route is outside this release. No purchase, email or Telegram
test message was sent.

| Check                                                      | Observed result                                        |
| ---------------------------------------------------------- | ------------------------------------------------------ |
| Isolated Linux build of `66ba251`                          | Passed; not activated independently                    |
| Combined mobile-fix artifact verification                  | Passed                                                 |
| Candidate Shop links and business regression checks        | 550/550 passed                                         |
| Activation time and running SHA                            | Approximately 21:52 UTC; `538e071`                     |
| Production Shop links and business regression checks       | 550/550 passed                                         |
| Production social checks                                   | 2,276/2,276 passed                                     |
| Public build settings and runtime unchanged                | Verified byte-identical                                |
| Staging application release, process and runtime unchanged | Verified                                               |
| Exactly active release plus `7ee2628` retained             | Verified; obsolete `c2331bd` removed                   |
| Unused Shop builder cleanup                                | Passed: build tree and eight guarded files removed     |
| Production transfer cleanup                                | Two artifact copies removed; rollback records retained |

The Shop-only artifact checksum was verified before cleanup:
`7cbefba2f7a3f1469fee273eec649a61ff69bee3d51b96907d692ef4f618b24c`.
Its root-owned build inputs/output were removed; audit helpers and the
operator-owned upload copy remain. The combined release record identifies the
artifact actually activated.

The preceding social-preview release has its own
[verification and platform-refresh record](2026-11-11-social-previews.md).
This destination-only change does not claim another sharing-app cache refresh.
