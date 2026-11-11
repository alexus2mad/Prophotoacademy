# Academy navigation, partner interaction and work galleries — 12 November 2026

## Change

Figma frame `853:190` and the designer's supplied screenshots identify the
“\*вчимо Бачити більше” Academy page as the learning index. Studio navigation now
uses `/academy` for the overview and `/academy#courses` for course-specific entry
points. The competing generic catalog is no longer a navigation destination.

Saved `/courses` URLs temporarily redirect to the Academy page, preserving all
query parameters. `category=course` also selects the course anchor. A temporary
redirect avoids persistent redirect loops if the retained legacy design is used
again. The static review renders the approved Academy template at the old URL,
with matching metadata and header state; the legacy catalog remains unchanged.
The Studio sitemap lists the approved Academy destination once.
Shared empty-account, checkout fallback, order-status, confirmation, inquiry,
review-unavailable and 404 links now go directly to the approved index. Course
back-links remain on its course section. No old catalog breadcrumb existed in
the structured data; existing course canonical URLs remain intact.

The partner rail distinguishes pointer focus from keyboard focus. Tapping or
dragging no longer draws its red outline, while keyboard interaction keeps a
visible focus indicator. Native horizontal scrolling and tap-to-pause remain.

Homepage student photographs and the AI Artwork image rail now open the shared
photo viewer. Existing course and student-work galleries use that same viewer.
Each collection retains its own sequence and attribution: 16 homepage images,
four artworks, the selected course's works, or the complete student-work set.
Course thumbnails, portraits, hero photographs and studio-room images retain
their existing behavior.

Horizontal swipes on the popup photograph move one image forward or backward.
Small movements, vertical gestures, cancellations, modified clicks and
multi-touch do not navigate. Buttons and keyboard navigation remain available;
Escape returns focus to the original trigger. The popup and its 44px controls
retain their previous dimensions. Thumbnail rail dragging does not open a photo.

## Source and verification

- Navigation/focus commit: `ad32752dd4039a69be35697cf512222e4291f676`
- Shared-gallery commit: `0c81b13a2e4e1c45b7a28f0a8bb9e659dbc810fa`
- Final combined source: `d1631709bd1e77946b3c63372dd028f69da630e0`
- Source archive SHA-256:
  `804e90ce64df24402b6270f9cd339eb1d6725ed0d2de9fee15816d0defb65917`
- Full final suite: 632 tests across 75 files passed
- TypeScript and architecture checks passed: 717 modules
- Changed files passed formatting and diff checks
- Synthetic Studio Pages build and 58-route validation passed
- Independent final export audit: no `/courses` destinations in 1,609 links or
  seven JSON-LD blocks across 57 HTML pages, excluding the compatibility alias
- Independent source review found no release blockers
- Deployment helpers passed 52 synthetic checks before remote application changes

The first navigation-only full-suite run had one five-second sandbox transaction
timeout. The complete rerun with two workers passed with unchanged assertions and
timeouts. A restricted Windows Pages compiler stalled; after stopping only that
verified build process, the normal-permission build and validation passed.
Original and successful logs remain in `.data/synced-navigation-release/`.
Gallery checks are under `.data/synced-gallery-validation/`; final source checks
and the rendered-link audit are under `.data/synced-final-validation/`.

Local browser checks at 390 × 844 verified the approved Academy layout and the
old catalog redirect with a retained campaign query and course anchor. Dragging
the partner rail moved it 240px with no outline; ArrowRight restored the 2px
keyboard focus indicator. These checks do not claim physical-iPhone testing.

Gallery browser checks at the same viewport verified forward/reverse image
swipes, ignored vertical dragging, arrow-key navigation and exact focus return.
The existing course popup remained 343 × 812px, with a 309 × 638px image region
and unchanged 44px controls. Homepage rail dragging moved to its second page
without opening a dialog; tapping its first image correctly opened image 5/16.
AI Artwork opened its own four-image sequence and advanced by swipe.

Screenshots are stored privately in
`.data/synced-navigation-release/screenshots/`.

## Deployment

The navigation-only and gallery-only preparations were held before compilation
or activation so that all subsequent requests enter the same release.
Both staging and production are live on `d1631709bd1e77946b3c63372dd028f69da630e0`,
using separate Linux builds with their own public settings. Runtime settings,
payment modes, private data and the separately served staging social-preview
gallery remained unchanged.

Staging is live on the final source revision. Its candidate and public checks
passed 611 application/assets assertions and 2,196 social-preview assertions
(19 routes, four crawler identities, all 66 images). Public browser checks at
390px confirmed the saved catalog redirect, approved Academy heading, pointer
outline removal and swipe navigation in the homepage gallery. Screenshot files:
`staging-live-academy.jpg`, `staging-live-partners.jpg`, `staging-live-gallery.jpg`.

Staging artifact SHA-256:
`b85590acbc91d83ba200e28e8003b0cd08b92c921584682f88ca03dd79410e71`.
Its public/runtime hashes remained unchanged, payment mode remains `mock`, and
the production service was unchanged during staging activation. No business
records or external messages were created for verification.

Production artifact SHA-256:
`3febd298cde77e78243d5dea523ab12df62c0d9bc2924955de0ef23ae98c79b0`.
Its candidate and public checks also passed 611 application/assets assertions
and 2,196 social-preview assertions. WayForPay configuration, closed course
sales, purchase email and the existing Make/Telegram integration were preserved.
Staging stayed healthy throughout production promotion.

Public production browser checks confirmed the approved Academy redirect and
partner pointer styling. Swipes advanced correctly in all four gallery families:
homepage 2/16, AI Artwork 2/4, student-work 2/42, and commercial course 2/24.
Controls remained 44 × 44px at 360, 390, 768, 1024 and 1440px viewport widths.
Screenshots and measured rectangles are in the private screenshot directory,
including `production-home-gallery-mobile.jpg`, `production-academy-mobile.jpg`
and `production-gallery-viewports.json`. These were browser viewport/pointer
checks, not a physical-device or frame-rate certification.

| Environment | Build ID                | Active source | Previous release | Verified PID |
| ----------- | ----------------------- | ------------- | ---------------- | ------------ |
| Staging     | `porHa14gYf4ZyeQSLtSgr` | `d163170`     | `2bf9515`        | `136159`     |
| Production  | `TDAB4fO6qDCQbeOE6g97_` | `d163170`     | `538e071`        | `136930`     |

The independently hosted staging social gallery passed all 153 checks after
promotion. Both runtimes, both public-settings hashes and nginx stayed
byte-identical. No purchase, email job or Telegram message was triggered for
verification. This release does not claim another social-app cache refresh.

Guarded cleanup retained exactly the active release and the previous release
listed above in each environment. It removed one obsolete application release
and two verified transfer archives per environment, preserving rollback records.
Both temporary candidate tunnels were stopped using their recorded process IDs.

The isolated builder's two final build trees and ten associated input/output
files were removed after checksum, ownership, path and inactive-process checks.
Ten superseded, never-started input/operator files and three final operator
transfer archives were also removed by exact allowlists. No application,
teaching-content, database, runtime or backup paths were part of builder cleanup.
Private rollback journals, deployment helpers and local evidence remain available.
