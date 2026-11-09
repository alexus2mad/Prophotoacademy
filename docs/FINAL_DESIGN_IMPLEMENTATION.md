# Final ProPhoto design implementation

Status: inspection complete; implementation in progress. Updated 9 November 2026.

## Source authority

The owner confirmed that **Figma takes priority**. The Claude artifact supplies
layouts absent from Figma and interaction behavior. Primary CTA text is white on
red, including hover, focus and touch states. Record every observed source
conflict in [the difference register](FIGMA_ARTIFACT_DIFFERENCES.md).

- [Figma website page](https://www.figma.com/design/CvY4dgmOevd9ehxk9Xsaqd/PROPHOTO-STUDIO?node-id=886-873&m=dev)
- [Interactive artifact](https://claude.ai/artifact/FwrroMxpu7ApuHRefQRW3t)

Read-only Figma context, screenshots, artifact DOM captures and the complete
original asset manifest are stored locally under `.data/final-design/`. They
are audit inputs, not generated application code. Temporary Figma URLs must
never appear in the running application.

## Inspected surfaces

| Surface | Figma node | Reference width | Implementation responsibility |
| --- | --- | --- | --- |
| Homepage | `886:873` | 1440 | Ecosystem hero, exposure sequence, learning directions, founder, proof, reviews, work, connected offers, inquiry |
| Homepage | `884:854` | 390 | Mobile composition and section order |
| Homepage, Studio tab | `897:405` | 390 | Alternate hero and direction state |
| Homepage, Shop tab | `898:424` | 390 | Alternate hero and direction state |
| Academy | `853:190` | 1440 | Program index, workshops, individual/corporate/camp, audience, proof, faculty, reviews |
| Studio | `854:417` | 1440 | Studio introduction, room galleries and booking destination |
| Shop | `854:539` | 1440 | Equipment introduction and selection inquiry |
| Contacts | `854:630` | 1440 | Contact details and inline inquiry |
| Inquiry | `854:755` | 480 | Right-side form and interaction states |
| Menu | `883:845` | 1440 | Three destinations and secondary navigation |
| Menu | `882:836` | 390 | Stacked mobile navigation |
| AI artwork | `892:397` | 1440 | Intensive, formats, program, instructor, work, inquiry |
| AI artwork | `893:401` | 390 | Mobile intensive and sticky enrollment action |
| Components | `849:2` | 1536 | Buttons, logos, headers, fields, cards and footer |

The artifact's four course detail states (camera, creator, Instagram and food)
were opened and captured individually, including package inquiry behavior.
The course container is populated at navigation time; its initially empty DOM
is not an absent design. The remaining artifact surfaces, responsive rules,
mobile menu and homepage tab behavior were also inspected.

## Foundation and legacy preservation

1. Introduce a deterministic `NEXT_PUBLIC_ACADEMY_DESIGN=legacy|studio`
   presentation selector. Keep the current implementation executable as
   `legacy`; activate `studio` only for the intended preview/release. Do not
   assign visitors randomly or expose an experiment selector publicly.
2. Select templates at Academy route/layout boundaries. Keep content retrieval,
   metadata, canonical URLs, auth, inquiries, enrollment and payments shared.
   Hub's existing shell and the embedded Sanity Studio are separate.
3. New components follow Atomic Design, one named component per file, colocated
   `types.tsx` and `hooks.tsx`. Use scoped styles and explicit composition;
   preserve the legacy styles rather than replacing them with global overrides.
4. Self-host the exact Figma families: KyivType Sans, Roboto Condensed and
   Marck Script. Keep the existing Source Sans 3 instructional system untouched.
5. Translate Figma's positions into responsive grid/flex layouts, preserving
   measured geometry at reference sizes. Retain source spacing formulas where
   accurate; any routine normalization must stay within the owner's 2px limit.
   Log malformed source layers separately rather than silently inventing fixes.
6. Keep all source imagery as local assets, with documented frame/layer mapping,
   explicit dimensions, accurate crops, useful alt text and appropriate loading.

## Page and interaction composition

- Shared shell: fixed 64px desktop / 56px mobile header, responsive navigation,
  native modal menu/drawer, footer, focus restoration and reduced-motion behavior.
  Checkout and order status retain focused navigation.
- Homepage: Academy initial state; tabs update their associated image, headline,
  CTA and relevant direction group. Keep automatic motion interruptible and
  respect reduced motion. Exposure progress is a visual effect only.
- Academy/catalog: use the new program-row treatment with real content and the
  existing filter-query contract. Preserve active products and original routes;
  do not erase products merely because a reference omits a row.
- Program details: use artifact geometry only where no Figma detail exists,
  applying Figma typography and shared controls. Bind existing prices, schedule,
  package differences and enrollment eligibility to the new presentation.
  Do not replace buyable packages with the artifact's inquiry placeholders.
- AI artwork, Studio and Shop: implement supplied presentation and connect its
  actions to the relevant existing service or contextual inquiry. Studio
  availability/payment remain in booking; no parallel booking engine is added.
  `/studio` remains the existing Sanity route.
- Contacts and inquiries: share submission, validation, attribution, consent,
  spam protection and honest success/error states between inline and drawer
  forms. No additional endpoint or simulated live success.
- Galleries/reviews: keyboard-operable, touch-scrollable, correct disabled
  states, stable focus, and no unnecessary automatic navigation.
- Account, lesson and administration business workflows stay intact. No new
  design is invented for screens absent from these sources.

## Verification and independently reviewable milestones

1. **Foundation:** variant isolation, exact local fonts/assets, shared shell and
   controls, legacy unaffected. Architecture, types, targeted boundary tests.
2. **Designed pages:** homepage, Academy, intensive, Studio/Shop presentations,
   contacts and all shared interactions. Compare source screenshots, then check
   real navigation and inquiry contexts.
3. **Existing journeys:** program/catalog adaptation, checkout and unavailable
   states, metadata, URLs and source-data accuracy. Preserve APIs and user access.
4. **Release:** formatting, architecture, TypeScript, relevant integration tests,
   full suite, production build and validated synthetic Pages export. Verify
   both selectable designs and unaffected Hub/workspace routes.

Save desktop/mobile screenshots at 390 and 1440 reference sizes, plus responsive
checks at 360, 768 and 1024. Check keyboard operation, 200% text enlargement,
reduced motion, long titles, asset loading, empty/closed offerings, query history,
form errors and review-mode restrictions. Record measured deviations; do not
claim pixel conformity from a successful build alone.

## Staging release

Deployment is explicitly staging-only. Follow [hosting](HOSTING.md) and
[staging isolation](STAGING_ISOLATION.md). The current host has limited memory;
prepare a Linux-compatible candidate with adequate build capacity rather than
running a full build alongside both live applications without a capacity plan.
Preserve staging configuration and payment mode. Activate the verified SHA,
check HTTPS/health and affected journeys, then retain active plus one previous
verified staging release. Do not modify production or booking services.
