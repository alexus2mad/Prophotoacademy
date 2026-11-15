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

- Preserve current prices: BASE 9,600, GOLD 29,900, PLATINUM 79,900 UAH and package
  promises. The user's subsequent instruction opens this course's three packages
  and confirms the Figma start of 27 November 2026. Other course offers remain
  unchanged. Figma's prices, VIP name, lecture schedule, installment text and
  remaining-seat claims do not update commerce.
- Benefits/process copy does not promise support or commercial practice in packages
  that omit it. The disclosure reveals the actual marketing curriculum, not an
  invented syllabus behind the prototype's closed row.
- Red primary buttons keep white text. Shared header/footer retain approved
  navigation, social and legal links. Existing section anchors remain valid.
- Keep the user-supplied high-quality Olena portrait. Oleksandra and the first
  two works reuse the Figma photographs at higher resolution. The two original
  faculty portraits are live while the additional portraits await review.
- The fourth gallery entry uses the full 1080 × 1440 portrait from the Academy
  Drive. Its uncropped frame fits inside the thumbnail and opens in the shared
  gallery dialog. [Drive original](https://drive.google.com/file/d/1wY35e1swHvFQ4imX1xD5De-7Y9wCz6CR/view)
- Gallery counts derive from actual entries.
- Remove heading-ending punctuation. Preserve review attribution and distinguish
  academy-authored stories from direct quotations.

## Faculty portraits saved for review

| Lecturer | Published portrait source |
| --- | --- |
| Ренат Зіганшин | [Kyiv-Mohyla training page](https://pro.ukma.edu.ua/trainings/training-visual-content), the named lecturer portrait for his joint training with Olena and Oleksandra |
| Анна Лютько | [YouTube for Business](https://youtube-for-business.sendpulse.academy/), the named author portrait from her own course |
| Андрій Провотар | [ProPhotoStudy](https://prophotostudy.com.ua/subject-food), the named lecturer portrait on the previous ProPhoto course |
| Наталія Авдєєва | [ProPhotoStudy](https://prophotostudy.com.ua/subject-food), the named lecturer portrait on the previous ProPhoto course |

The optimized WebPs are archived in `.data/creator-portraits/archived-webp/`.
Source photos and the contact sheets are in `.data/creator-portraits/`. Commit
`c254a69` records the asset paths and focal positions for future restoration.

## Interaction and responsive behavior

The course sections span the full viewport on desktop and use the Studio side
gutters. Individual text blocks retain their reading widths.

The hero's only action, “Програма”, jumps to the curriculum and opens its native
disclosure. Direct curriculum links also open it. Camera/phone filters cancel
momentum and reset the rail. Touch scrolling, desktop drag/inertia, keyboard
arrows and the shared captionless swipeable popup remain available. Reading
sections remain stationary. Mobile packages are vertical with all benefits visible.
The hero requests adequate image resolution for the tall mobile cover crop.

Closed CTAs open the real contextual inquiry drawer. Reopening an authorized
offering uses existing checkout URLs and server rules. The Studio CTA uses the
configured Hub booking destination.

The open offer displays `Старт 27.11` in the hero and introduction, using semantic
dates with the complete date available to assistive tools. Production retains
WayForPay; staging retains simulated payments. Prices may wrap between thousands
groups at enlarged text sizes, never inside a digit group. The curriculum has
one disclosure indicator, with the inherited global indicator suppressed.

## Verification evidence

Headless responsive checks cover 360, 390, 768, 1024 and 1440px, disclosure,
filters, popup keyboard navigation, Escape and contextual inquiries without
submitting. Screenshots are in ignored `.data/content-creator-design/qa`.
Focused tests cover route isolation, legacy retention, stale enrollment IDs under
closed sales, authorized open packages, real prices, curriculum, gallery counts
and preview-base-path assets. Release checks are recorded separately.
