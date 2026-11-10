# Studio design and interaction review — 10 November 2026

The review uses the [Figma file](https://www.figma.com/design/CvY4dgmOevd9ehxk9Xsaqd/PROPHOTO-STUDIO), the [interactive artifact](https://claude.ai/artifact/FwrroMxpu7ApuHRefQRW3t), and the [designer's comparison](https://claude.ai/artifact/DfJf443box4s3MAgJpPaWg). Explicit decisions are recorded in [the source register](FIGMA_ARTIFACT_DIFFERENCES.md). Separate UI and UX reviewers inspected the final implementation and played the reference interactions; findings were corrected before release.

## Corrected behavior

| Area | Correction |
| --- | --- |
| Exposure | Recovered the actual iframe script. Restored the desktop 150vh runway, sticky stage, brightness, 33 bars and −3→0 EV. Mobile uses the source black-to-paper transition, white/red phases and 0→+3 EV. Forward and reverse scrolling use the same calculation. |
| Hero | Restored 900ms crossfades, 3s Academy portraits, 12s Studio panorama and 12/9/7s mode dwell. Manual selection stops mode changes while the selected photography continues. Hidden/offscreen and reduced-motion states suspend animation. |
| Course navigation | Tracks the current section, exposes `aria-current`, and centers the active mobile anchor without scrolling the document. |
| Gallery | Uses actual image offsets instead of the first image's width; observes image resizing and reports the final count at the track boundary. |
| Homepage reviews | Eight initially; all eleven after expansion; eight after collapse. Expanded layout hides carousel controls. Quote/story attribution and source links remain explicit. |
| Partner strip | Restored the original full logo image and 42s seamless loop. Decorative duplicate has an empty alt. Hover/focus pauses it; reduced motion leaves a stationary scrollable strip. |
| Header | Restored transparent blur and contrast for each control over the actual section beneath it, including mixed course heroes and the mobile exposure transition. |
| Mobile actions | Shared compact 68px and spacious 84px bottom actions on destination pages, including safe-area spacing. Homepage does not gain a competing fixed action. |
| Disclosures and feedback | Mobile audience details open explicitly; desktop descriptions remain visible. AI indicators rotate, summaries respond on hover, and copy confirmation resets after 1.5s. |
| Card zoom | At the user's request, restored the earlier approved 1.065 image scale and −6px title motion, 1800ms entry/1400ms exit. Reused the opt-in mobile scroll controller; stationary frames and a separate paint-contained image layer keep edges stable. |

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

Browser checks covered 1440px desktop, 768px tablet and 360/390px phones across homepage, Academy, Studio, Shop, Contacts, AI and course pages. Verified exposure forward/reverse, manually selected hero animations, 8→11→8 reviews, gallery forward/back, sticky mobile actions and active course sections. Dedicated motion checks confirmed stationary frames and mobile row handoffs. Source checks distinguish classic scrollbar width from actual layout overflow.

Pure exposure and gallery tests cover boundary/reverse states, reduced motion and unequal image offsets. Package presentation tests retain checkout/inquiry/unavailable/disabled behavior in both layout orders. Shared motion tests retain the legacy opt-in boundary and reduced-motion behavior.

The repository-wide formatter reports existing style drift in unrelated files; changed files pass scoped formatting. Do not reformat the preserved legacy implementation merely to hide this baseline. Release results and build identities belong in [the release record](STUDIO_REVIEW_RELEASE.md).

## Deliberate differences

Real forms retain consent, validation, failure and retry states. Real bookings and purchases never use the artifact's fake success handlers. Academy/program all-review links continue to the existing `/reviews` route; homepage expansion follows the artifact. Unknown schedules and inquiry-only programs remain truthful. The user-approved legacy card zoom overrides the artifact's simpler hover effect.

Figma remains authoritative for static typography and geometry where the designer did not choose the artifact. Existing documented font inconsistencies and real content differences mean this is not an unconditional 2px certification. No learning content, authentication, payment, entitlement or completion policy was changed.
