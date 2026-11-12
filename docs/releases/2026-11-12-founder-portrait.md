# Homepage founder portrait — 12 November 2026

Staging and production run source `72461f56cd132ba9fbd93e2f4393d500cd94fcf8`.
The homepage founder section uses the supplied `IMG_5902.JPG` (4480 × 5952 px,
approximately 5 MB) in two WebP versions.

| Version | Dimensions | Bytes | Public path |
| --- | --- | ---: | --- |
| Desktop | 1920 × 2551 | 563,368 | `/images/hero/olena-popova-home-desktop-0b99e13145d8-1920.webp` |
| Mobile | 1280 × 1344 | 162,718 | `/images/hero/olena-popova-home-mobile-2b88b2c84b6b-1280.webp` |

| Environment | Build ID |
| --- | --- |
| Staging | `zR484xfGENJrohnYSesCE` |
| Production | `6bLXh_xX9dpu-Q8nxDMwv` |

Automated tests were skipped at the user's request. Each environment completed
its Linux build and passed candidate and live HTTP checks. The homepage
referenced both images, the served files matched the committed bytes, and both
health endpoints responded successfully. Runtime configuration matched the
preceding release in each environment.

Both environments retain this release and the previous verified release
`72f961cde29e67790684e0a97b34b9616a6c06d4`. Cleanup removed the obsolete
`f0dd6c4` builds, the isolated builder's 18 temporary paths and four temporary
deployment archives. Deployment receipts are under `.data/founder-portrait-release/`.
