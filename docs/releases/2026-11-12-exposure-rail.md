# Exposure title and partner rail - 12 November 2026

Source `073d0f0cfeb1e7e2471766e8efc72d0dd1e72af3` restores the complete exposure
heading and removes the word rearrangement, duplicated text layers and their
layout observers. The title remains opaque through the first half of the
exposure journey, then fades as a whole. The image, meter and scroll pace retain
their existing behavior.

The partner rail now loops on mobile and desktop through native scroll
position. Pressing, tapping or otherwise interacting pauses autoplay so the
visitor can swipe, drag or use the keyboard. A fixed number of identical strips
covers the viewport plus the loop boundary; resize may update that count, but
time and repeated loops never append copies. Only the first strip exposes its
partner-list alternative text. Offscreen, hidden-page and reduced-motion states
suspend autoplay.

## Focused verification

Architecture and scoped formatting checks passed. Local Chrome checks at
390x900 and 1920x900 verified autoplay, pointer interaction, real emulated touch
swipes, mouse dragging and arrow-key scrolling. Eight repeated seam crossings
per viewport preserved the same child count: two strips / five descendants on
mobile and three strips / seven descendants on desktop. Resizing from
3440px to 390px to 1920px produced four, two and three strips respectively,
without document overflow. No browser page errors occurred.

The exposure title remained one heading with no morph layers. Its opacity was
1, 1, approximately 0.5 and 0 at progress 0.25, 0.5, 0.75 and 1 on both layouts.
Source review confirmed a single pending animation frame and observer,
listener and frame cleanup. Screenshots and results are retained under
`.data/exposure-rail-qa/`. This verifies bounded DOM behavior and lifecycle
cleanup; it is not a multi-hour heap profile or physical iOS/Safari device test.
The full automated suite was not run, following the user's instruction.

## Deployment status

Staging and production run this source. Both Linux builds, bounded candidate
checks, live public-page and health checks passed. The focused browser review
also passed on staging and production, covering desktop/mobile loops, manual
interaction, responsive copy counts, reduced motion and the restored title fade.

| Environment | Build ID |
| --- | --- |
| Staging | `8wp6zmRclvJ2yxpp90glQ` |
| Production | `GjwfuAfaXK1fukrIEK53Y` |

The homepage renders one exposure heading and the bounded rail, with no
obsolete word-morph layers. `/academy` responds successfully; the separate
staging social-preview gallery remains available with `noindex`. Each
environment's runtime configuration is byte-for-byte unchanged. Staging keeps
simulated payments and `noindex`; production retains live WayForPay and
indexing.

Both environments retain this source and the previous verified release
`c616755d446ceddc2656df635eecfdde30790cb1`. Cleanup removed the obsolete
`72461f56cd132ba9fbd93e2f4393d500cd94fcf8` application build in each environment,
four temporary app-host deployment archives and all 18 reviewed temporary
builder paths. Checksums and canonical-path guards constrained the cleanup;
all reviewed temporary paths were confirmed absent. Release evidence is under
`.data/exposure-rail-release/`.
