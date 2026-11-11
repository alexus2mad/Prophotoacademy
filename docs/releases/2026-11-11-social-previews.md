# Branded social previews — 11 November 2026

Status: released to production at 23:16 Europe/Kyiv (21:16 UTC) on
11 November 2026. Production checks and release cleanup passed. Facebook
refresh completed; Telegram remains a manual owner handoff.

## Scope and design

Source commit: `7ee2628d942029937aad2e6e45f47504eb8d8921`.
Production destination: <https://prophotoacademy.com.ua/>.
At activation, the rollback was `c2331bd743e609e48caff40d6a527faadb0ef59d`;
staging remained `2bf9515a1667e40bdadf95caea2dc0ec60b28072`. The later
[mobile scrolling release](2026-11-11-mobile-scroll.md) retains this social-preview
release as its rollback and removes that older application release.

The release provides 33 page-specific artworks, each as a 1200×630 landscape
and 630×630 square JPEG: 66 static files. Coverage includes 17 indexable Academy
pages, two retained unlinked designs, six safe private route families and eight
Hub routes. Open Graph metadata and Twitter large-card metadata use the same
page identity. Image retrieval requires no JavaScript, cookies, CMS query or
image-rendering endpoint.

Artwork uses existing public ProPhoto photographs, supplied Studio assets,
original vector wordmarks, Roboto Condensed Bold and KyivType Sans. The palette
is paper `#fbfbfb`, ink `#150b08` and red `#eb423b`. Landscape and square variants
have separately composed crops; outputs are sRGB JPEGs without EXIF, at most
300,000 bytes each. No prices, intake dates, availability or invented testimonials
are embedded. The Food Photography pasta image illustrates the subject, without
claiming a result from that particular course.

Private-route metadata uses generic cards and discards private title,
description, query and URL overrides. No protected lesson assets or customer
records are included. Unknown future public pages receive the branded fallback
until dedicated artwork is authored.

This is an application-only release. It changes no runtime environment,
credentials, database, payment policy, entitlement, purchase notification, email,
service definition or timer. Course sales remain closed; existing access remains.
Public image paths bypass host rewriting and session refresh without changing
authorization rules.

## Provenance

| Item                                     | SHA-256                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| Source archive                           | `aa1380c5ae5989366038f04b30e4146a48071c2ae19e4c64ff3afb736a2886ad` |
| Linux production artifact                | `66bc538db6ac754c6ff14135691219abf333e61b5f1be52f61884db5309ea0d5` |
| Expected unchanged public build settings | `233fa52075a4cc108814b213412bb610902e35dc8f2c426ca26a1257beb99fa3` |
| Expected unchanged runtime               | `f00a21b4abed50ef28a566cd7a021246d927f72115590f2c2b9c4e6f5a59e00e` |
| Artwork source fingerprint               | `fb6c7f2d65ad1a5d3bd86c123d5e02beff1da511b9d9c20ad566a130c91bb46b` |

The artwork plan is `scripts/social-images/catalog.ts`; the output manifest is
`src/lib/social-images/images.json`. Offline generation uses Sharp/Pango. The
KyivType TTF is a lossless decode of the existing WOFF2, documented in
`scripts/social-images/FONT-PROVENANCE.md`.

Hashed filenames allow immutable image caching. Keep previously published
images available for cached page previews. A new image filename does not itself
invalidate a messaging app's cached page metadata. See [social-preview
maintenance](../SOCIAL_PREVIEWS.md).

## Verification

- Full suite: 565 tests across 71 files passed
- Architecture: 708 modules passed; TypeScript and scoped formatting passed
- Linux production build passed
- Synthetic Pages export: 58 routes validated, including image variants,
  dimensions, byte limits, alt text and prefixed absolute URLs
- Candidate social checks: 2,276/2,276 passed
- Candidate payment/link regression checks: 492/492 passed
- Production social checks: 2,276/2,276 passed
- Production payment/link regression checks: 492/492 passed

The first social-verifier run reported four root-URL mismatches because its
comparison treated a trailing slash as a difference. The private verifier was
corrected and rerun; no application source changed for that correction.

Social checks cover 20 pages with Facebook, Telegram, WhatsApp and Viber crawler
user agents, plus all 66 images via anonymous GET/HEAD, image checksums,
dimensions, byte counts and database health. These requests do not submit
purchases, send email, change authentication or emit purchase notifications.
Crawler checks demonstrate the delivered metadata and assets, not rendering or
cache invalidation inside each app.

Private review material is under `.data/social-images/`; deployment evidence
and HTTP reports are under `.data/social-release/`.

## Activation and cleanup

| Check                                                | Observed result                                                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Activation time and running SHA                      | 23:16 Europe/Kyiv (21:16 UTC), 11 November 2026; `7ee2628d942029937aad2e6e45f47504eb8d8921`               |
| Production social HTTP checks                        | 2,276/2,276 passed                                                                                        |
| Production payment/link regression checks            | 492/492 passed                                                                                            |
| Public-settings and runtime hashes unchanged         | Verified against both hashes above; live WayForPay and Make purchase-notification configuration preserved |
| Staging release, process and configuration unchanged | Verified; staging remains `2bf9515a1667e40bdadf95caea2dc0ec60b28072`                                      |
| Final social-preview browser review                  | Facebook homepage image visually verified; screenshots saved under `.data/social-images/`                 |
| Release retention                                    | Exactly `7ee2628` and `c2331bd` retained; obsolete `5ae3eca` removed after successful checks              |
| Temporary transfer cleanup                           | Both production artifact copies removed                                                                   |
| Isolated builder cleanup                             | Candidate directory and eight verified temporary input/output files removed by guarded cleanup            |

## Sharing-app refresh

| Platform | Status and boundary                                                                                                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Facebook | All 17 public Academy URLs returned “Ошибок нет” in batch invalidation. The homepage was also individually scraped again: fresh HTTP 200, the expected image URL and visible preview were confirmed                    |
| Telegram | The owner explicitly requested no agent use of Telegram and was told production was ready at 23:16 Europe/Kyiv (21:16 UTC). No agent messages or agent-submitted refresh; completion awaits the owner's manual handoff |
| WhatsApp | No documented operator-controlled page-preview purge was found. New image filenames do not guarantee a page-cache refresh                                                                                              |
| Viber    | No documented operator-controlled page-preview purge was found. Do not claim global invalidation                                                                                                                       |

Facebook's verified homepage image is
<https://prophotoacademy.com.ua/social/home-9a0f91d1c3a9-wide.jpg>.
Evidence: `.data/social-images/facebook-homepage.png` and
`.data/social-images/facebook-batch.png`. An optional `fb:app_id` warning remains;
it did not prevent the observed homepage image preview. Batch responses confirm
the refresh requests succeeded; only the homepage was individually inspected
visually. They do not prove every messaging app has refreshed its cache.

Apps choose their own crop and may ignore the square companion. Privacy settings
can suppress previews. Previously sent messages are not assumed to update after
a refresh. Report verified website delivery, requested platform refreshes and
observed in-app previews separately.
