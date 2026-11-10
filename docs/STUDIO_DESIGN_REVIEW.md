# Studio design and interaction review — 10 November 2026

The review uses the [Figma file](https://www.figma.com/design/CvY4dgmOevd9ehxk9Xsaqd/PROPHOTO-STUDIO), the [interactive artifact](https://claude.ai/artifact/FwrroMxpu7ApuHRefQRW3t), and the [designer's comparison](https://claude.ai/artifact/DfJf443box4s3MAgJpPaWg). Explicit decisions are recorded in [the source register](FIGMA_ARTIFACT_DIFFERENCES.md). Separate UI and UX reviewers inspected the implementation and played the reference interactions. The verification section distinguishes completed checks from remaining work; a source comparison alone does not certify the resulting user interaction.

The user's latest clarification makes the previously approved, polished image zoom and title movement authoritative for cards. Keep useful behavior recovered from the artifact, including synchronized exposure, while correcting broken triggers and accessibility problems. Matching the artifact does not require reproducing its bugs or replacing an explicitly approved interaction with its simpler version.

## Corrected behavior

| Area | Correction |
| --- | --- |
| Exposure | Recovered the actual iframe script for synchronized brightness, 33 bars and −3→0 EV. The subsequent user override extends the desktop section to 300vh, giving four times the original effective exposure distance, and keeps the heading visible through the first half before fading it. Mobile retains its compact black-to-paper transition, white/red phases and 0→+3 EV. Forward and reverse scrolling use the same calculation. |
| Hero | Retains 900ms crossfades, 3s Academy portraits, 12s Studio panorama and 12/9/7s mode dwell. Outgoing photographs keep their current crop and pose throughout the fade; rapid returns resume that pose. The requested Academy/Shop drift uses restrained ease-in-out motion. Manual selection stops mode changes while photography continues; hidden/offscreen and reduced-motion states suspend animation. |
| Course navigation | Tracks the current section, exposes `aria-current`, and centers the active mobile anchor without scrolling the document. |
| Gallery | Uses actual image offsets instead of the first image's width; observes image resizing and reports the final count at the track boundary. |
| Homepage reviews | Eight initially; all eleven after expansion; eight after collapse. Expanded layout hides carousel controls. Quote/story attribution and source links remain explicit. |
| Partner strip | Restored the original full logo image and 42s seamless loop. Decorative duplicate has an empty alt. Hover/focus pauses it; reduced motion leaves a stationary scrollable strip. |
| Header | Restored transparent blur and contrast for each control over the actual section beneath it, including mixed course heroes and the mobile exposure transition. |
| Mobile actions | Shared compact 68px and spacious 84px bottom actions on destination pages, including safe-area spacing. Homepage does not gain a competing fixed action. |
| Disclosures and feedback | Mobile audience details open explicitly; desktop descriptions remain visible. AI indicators rotate, summaries respond on hover, and copy confirmation resets after 1.5s. |
| Card zoom | Retains the approved 1.065 image scale and −6px title motion, 1800ms entry/1400ms exit. Studio now elects one active card from actual pointer, keyboard or scroll input; it no longer activates an entire row. Stationary frames and a separate paint-contained image layer keep edges stable. |

## Corrected layout

- Mobile Contacts now shares the source 52px/42px heading hierarchy and 88px top spacing.
- Narrow course heroes use an explicitly shrinkable grid track; 360px pages no longer overflow horizontally.
- Academy training panels use source responsive padding/type and stack at 760px; 768px layouts no longer overflow.
- Academy mobile jump navigation uses the measured centered 6/22px gaps, 11px type and 16px block padding.
- Academy lecturer photographs preserve 3:4 proportions; secondary-page forms, room images, labels and hero spacing match the selected source.
- AI facts, title, announcement spacing, mobile action and desktop lecturer rows were corrected from measured values. The first curriculum block remains open because Figma explicitly shows that state.
- Program facts, catalog thumbnails, package benefit/price order and review controls were aligned without changing live price, eligibility or checkout policy.

## Verification evidence

Private local evidence is in `.data/design-review/`: independent UI/UX reports, captured source scripts, measurements and screenshots. It is deliberately excluded from Git and the review export.

Browser checks covered 1440px desktop, 768px tablet and 360/390px phones across homepage, Academy, Studio, Shop, Contacts, AI and course pages. Verified exposure forward/reverse, manually selected hero animations, 8→11→8 reviews, gallery forward/back, sticky mobile actions and active course sections. Source checks distinguish classic scrollbar width from actual layout overflow.

### Hero transition correction and exposure pacing override

The user reported a Studio panorama snap before its outgoing fade. The active-only CSS selector removed both the oversized image width and its animation immediately: the image shrank from 1638.75px to 1425px while still visible. Studio geometry now remains constant, and each outgoing image pauses at its current animation position until its wrapper is fully transparent. Cleanup accepts only that wrapper's completed opacity transition while it remains inactive at opacity zero. Returning before the fade completes resumes the retained pose; returning after a completed fade starts a fresh cycle.

Actual browser checks confirmed an outgoing Studio image remained 1638.75px wide at opacity 0.646, holding its −213.75px translation. Fully hidden, it reached opacity zero and released its animation; the next visit began near −3.5px. A rapid Studio → Academy → Studio sequence retained the trajectory (approximately −3.129px, −5.18px, then −9.928px) rather than jumping to zero. These checks exercise the transition itself, not only its settled endpoints. Six independently run lifecycle tests cover retention, interrupted fades, stale/descendant events and reduced motion.

The requested Academy/Shop motion is a separate user override: a 1.015→1.045 scale with a small two-axis drift, easing in and out over 6s for Academy and 8s for Shop, alternating smoothly. The drift remains within the image's overscan. Browser samples confirmed both animated transforms; the existing 3s Academy photograph changes remain in place. Studio remains stationary on the narrow layout, and reduced motion disables these photographic animations.

The user also requested slower exposure travel and a later title fade. Desktop now uses a 300vh section around its 100svh stage. With the existing `.8` progress factor, full exposure requires 160vh of travel instead of 40vh: 1440px instead of 360px at a 900px viewport. The heading stays fully visible through progress 0.5, then fades linearly to zero at progress 1; the earlier blur is removed. Mobile keeps its compact section and applies the same title curve to its existing transition value. A readiness flag keeps the heading visible before measurement or without JavaScript; reduced motion leaves it visible. Seventeen exposure tests pass.

Actual native-wheel input at 1440×900 verified the new pacing. Four, eight, twelve and sixteen 90px steps produced progress 0.246, 0.496, 0.746 and 0.996 with title opacity 1, 1, 0.508 and 0.008 respectively. The initial section offset was 6px; a final 9px movement reached progress 1, image brightness 1 and title opacity 0. Reversing 360px restored progress 0.752 and opacity 0.496. Evidence is saved as `.data/design-review/exposure-wheel-samples.json` and `local-exposure-title-fade.png`. At 390px, the exposure section remained compact at approximately 283.36px with no document overflow; Shop's ease-in-out transform was also observed. These checks supersede the earlier source-timing verification for the changed pacing.

### Card trigger verification correction

The earlier card checks confirmed transform values and stationary frame geometry, but missed the input failure reported by the user: a viewport-center observer activated every intersecting card in a row, while desktop hover depended on media queries that the in-app browser reported as `hover: none`. Those geometry checks are superseded as evidence of correct interaction. Multiple cards moving together was a defect, not an approved effect.

Studio has an explicit single-card policy, separate from the inactive legacy design's preserved row observer:

- Real mouse or hovering-pen input targets the card under the pointer, independently of the `hover` media query. Moving to another card transfers activation; moving to blank space clears it. Desktop scrolling alone does not activate a row, and scrolling under a stationary mouse rechecks the actual hit target.
- Keyboard-visible focus selects its card. A subsequent real pointer movement can take over; ordinary click focus must not pin an old card.
- Mobile scrolling selects one sufficiently visible card, accounting for both axes and clipping by horizontal rails. Leaving the card area clears activation. Horizontal travel must produce a meaningful handoff between visible columns, not remain on the same column at both ends of the rail.
- Reduced motion, a hidden document or a blurred window clears motion. The controller stays opt-in; lessons, exposure and arbitrary images do not acquire card zoom.

Actual desktop browser input passed card 1 → card 2 → blank space, stationary-pointer wheel retargeting and keyboard Tab selection. The selected image settled at scale 1.065 with a −6px title offset; inactive images returned to their identity transform and card frames stayed fixed. Mobile vertical scrolling passed row handoff and clearing after the grid leaves view.

The first horizontal selection formula still chose the second column nearest the viewport center at both rail ends. That defect was caught in the browser and corrected: the focal point now travels across the visible rail with horizontal scroll progress, while clipping and hysteresis prevent offscreen selection and unstable switching. A fresh 390px browser check passed native horizontal travel at 0, about 59px and 124px: **Курси → Воркшопи → Корпоративне навчання**, followed by a vertical handoff to **ProPhoto Кемп**. Exactly one card was active at each stop, with no document overflow. Independent continuous forward/reverse geometry checks also reached all three columns; they supplement this actual-input evidence.

Pure exposure and gallery tests cover boundary/reverse states, reduced motion and unequal image offsets. Package presentation tests retain checkout/inquiry/unavailable/disabled behavior in both layout orders. Studio motion tests exercise exclusive pointer selection, input changes, clipping, focus, lifecycle and reduced motion; legacy tests preserve the separate inactive variant. These tests supplement actual input checks rather than replacing them.

The repository-wide formatter reports existing style drift in unrelated files; changed files pass scoped formatting. Do not reformat the preserved legacy implementation merely to hide this baseline. Release results and build identities belong in [the release record](STUDIO_REVIEW_RELEASE.md).

## Deliberate differences

Real forms retain consent, validation, failure and retry states. Real bookings and purchases never use the artifact's fake success handlers. Academy/program all-review links continue to the existing `/reviews` route; homepage expansion follows the artifact. Unknown schedules and inquiry-only programs remain truthful. The user-approved earlier card choreography overrides the artifact's simpler hover effect; preserving that choreography does not require retaining the legacy row activation policy in Studio.

Figma remains authoritative for static typography and geometry where the designer did not choose the artifact. Existing documented font inconsistencies and real content differences mean this is not an unconditional 2px certification. No learning content, authentication, payment, entitlement or completion policy was changed.
