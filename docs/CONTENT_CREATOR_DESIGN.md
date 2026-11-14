# Content Creator page — November 2026

The Studio presentation of `/food-product-photography` uses updated Figma frame
**949:443** in `CvY4dgmOevd9ehxk9Xsaqd`. Route, program and package identities
remain unchanged. Other courses retain `StudioProgramTemplate`; the unused legacy
design retains `ProgramTemplate`.

## Sources and layout

The live Figma context, screenshot and asset exports were inspected on 15 November.
The desktop composition is a monochrome hero, centered introduction, six audience
cards, six benefit rows, collapsed curriculum, five learning steps, filtered work
rail, eleven lecturer rows, reviews, package comparison, inquiry and Studio offer.

The public Claude shell was accessible by HTTP, but its content endpoint required
a browser challenge. Complete saved November 9–10 HTML, CSS and interaction scripts
supply supplementary responsive guidance, not proof of the current artifact revision.
No computer-use automation was used.

Focused Atomic Design components compose the page. Editorial copy and local assets
live in `src/lib/studio-creator`; commerce stays in existing offering/enrollment
selectors. `ProgramPackages` and `PackageCard` accept an explicit `editorial`
presentation without changing eligibility or other layouts.

## Intentional exceptions

- Preserve current prices: BASE 9,600, GOLD 29,900, PLATINUM 79,900 UAH, package
  promises and closed sales. Figma's prices, VIP name, date, lecture schedule,
  installment text and remaining-seat claims do not update commerce.
- Benefits/process copy does not promise support or commercial practice in packages
  that omit it. The disclosure reveals the actual marketing curriculum, not an
  invented syllabus behind the prototype's closed row.
- Red primary buttons keep white text. Shared header/footer retain approved
  navigation, social and legal links. Existing section anchors remain valid.
- Keep the user-supplied high-quality Olena portrait rather than restoring Figma's
  older photograph. Oleksandra and the first two works reuse the same photographs
  at higher resolution. Nine empty lecturer photo slots remain intentionally empty.
- The fourth Figma work image is a cropped half-width asset. Keep its narrow
  fragment, without stretching it into a full portrait. Gallery counts derive
  from real entries rather than the prototype's `30`.
- Remove heading-ending punctuation. Preserve review attribution and distinguish
  academy-authored stories from direct quotations.

## Interaction and responsive behavior

The curriculum is a native collapsed disclosure. Camera/phone filters cancel
momentum and reset the rail. Touch scrolling, desktop drag/inertia, keyboard
arrows and the shared captionless swipeable popup remain available. Reading
sections remain stationary. Mobile packages are vertical with all benefits visible.
The hero requests adequate image resolution for the tall mobile cover crop.

Closed CTAs open the real contextual inquiry drawer. Reopening an authorized
offering uses existing checkout URLs and server rules. The Studio CTA uses the
configured Hub booking destination.

## Verification evidence

Headless responsive checks cover 360, 390, 768, 1024 and 1440px, disclosure,
filters, popup keyboard navigation, Escape and contextual inquiries without
submitting. Screenshots are in ignored `.data/content-creator-design/qa`.
Focused tests cover route isolation, legacy retention, stale enrollment IDs under
closed sales, authorized open packages, real prices, curriculum, gallery counts
and preview-base-path assets. Release checks are recorded separately.
