# Partner idle resume and student gallery dragging - 12 November 2026

Source `247346c7a8b4d3d59cfe0576b1bbad2f553722ee` makes partner autoplay resume
three seconds after the last pointer, touch or horizontal-scroll interaction.
The restart accelerates smoothly over one second from the visitor's current
position. Holding a pointer or touch keeps motion paused; native touch momentum
extends the idle deadline until scrolling stops. Keyboard focus, reduced
motion, hidden pages and offscreen sections continue to pause autoplay.

Student-work rails support mouse dragging on desktop and a short, decelerating
coast after release. Touch keeps the browser's native scrolling. Arrow buttons,
new pointer input, wheel input, keyboard input and reduced motion cancel the
coast. Ordinary image clicks still open the gallery; completed drags suppress
the accidental click. Inertia is explicitly enabled only for the student-work
rails, not for every horizontal strip. The bounded logo copy count and the
restored exposure heading remain unchanged.

## Verification

Architecture, scoped formatting and 38 focused tests passed: 16 partner-marquee
checks and 22 drag/gallery checks. The complete automated suite was not run.

Local Chrome browser checks covered the logo rail at 390px and 1920px, plus
student work on the homepage and AI Artwork at 1440px. Measured visible logo
motion resumed approximately 3.4-3.5 seconds after interaction, following the
three-second idle interval and gradual acceleration. The early motion covered
fewer pixels than the subsequent interval. The rail retained two copies / five
descendants on mobile and three copies / seven descendants on desktop, without
a pointer-focus outline.

Both student-work rails coasted smoothly after mouse release and stopped in
approximately 1.2 seconds. Arrow controls interrupted coasting, and reduced
motion disabled it. No browser page errors occurred. Read-only browser evidence
and screenshots are retained under `.data/rail-interaction-qa/local/`. This is
not a multi-hour browser heap profile or a physical iOS/Safari device test.

## Deployment status

Both environments run this source. Their Linux builds, bounded candidate
checks, live route checks and health checks passed. Runtime configurations
remain byte-for-byte unchanged: staging retains simulated payments and
`noindex`; production retains live WayForPay and indexing. The separate staging
social-preview gallery remains available.

| Environment | Build ID |
| --- | --- |
| Staging | `-KI-GUZbFMBdkrsQkOWxV` |
| Production | `xO3SimlNqbvL1mPyP8sLP` |

The staging browser review passed, including a native touch probe that held a
finger down for 4.5 seconds: autoplay stayed paused during the hold and resumed
only after release and the idle interval. Production logo and held-finger probes
also passed. Production homepage and AI Artwork gallery checks passed in a
fresh browser after a transient local Chromium `ERR_NO_BUFFER_SPACE` navigation
error. All production interactions passed on that retry; combined evidence is
under `.data/rail-interaction-qa/production/verification.json`.

Candidate and live checks passed for `/`, `/academy`, `/ai-artwork`,
`/student-work` and `/food-product-photography`, plus health and the existing
bounded homepage markup.

Both environments retain the new release and the previous verified source
`073d0f0cfeb1e7e2471766e8efc72d0dd1e72af3`. Cleanup removed the obsolete
`c616755d446ceddc2656df635eecfdde30790cb1` application build in each environment,
all four temporary app-host transfer archives and all 18 reviewed temporary
builder paths. Checksums and canonical-path guards constrained the builder
cleanup, and every reviewed temporary path was confirmed absent. Release
receipts are under `.data/rail-interaction-release/`.
