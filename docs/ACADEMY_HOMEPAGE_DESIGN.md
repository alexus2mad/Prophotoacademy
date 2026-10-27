# Academy homepage — October 2026

The central Academy frame in Figma file `CvY4dgmOevd9ehxk9Xsaqd`, page `724:216`, is the reference. Its annotations replace the repeated mockup labels with six directions and identify the first ecosystem banner as the studio. Hub and Shop remain separate destinations.

The homepage pairs KyivType Sans Black for the hero and brand wordmarks with Inter for supporting typography: thin 100 / bold 700 in the slogan, extra bold 800 in the direction titles, and regular 400 in body copy. It uses the design's wording, underwater opening, black canvas, square photographs, founder introduction, partner strip, testimonials and shop banner. Existing CMS testimonials replace duplicated placeholder quotes. Existing program slugs/catalog filters and the inquiry dialog supply functioning destinations. The camp is an inquiry, with no invented availability or payment.

## Image sources

`content/source/academy-home-photos.json` records the source and original dimensions for each photograph. Most are from the supplied Drive stock. The underwater original is 5760 × 3840; the largest delivered hero is 2400 pixels wide and below 150 KB. Responsive files use content hashes under the existing immutable `/images/hero/` cache policy. Only the opening photograph is preloaded; lower sections load lazily. Mobile requests a sufficiently large source for the tall crop.

`node scripts/prepare-academy-home.mjs` explicitly refreshes these committed variants from their recorded sources. Builds need no access to Google Drive. `home-images.json` contains presentation metadata and `prepared-home-images.json` feeds the shared image component. Review regenerated files before committing; old hashed assets can be removed only once no manifest references them.

Two mockup photographs could not be found in the supplied Drive folders: the dark-haired model beside a rock and the snowy forest with white fabric. Their positions use an original curly-haired black-and-white portrait and the red-fabric coastal photograph, respectively. The six direction cards each use a distinct Drive photograph: a blue-and-yellow studio portrait for individual training, a strawberry suspended in water for corporate training, and a sunlit seaside portrait for camp. Their focal positions preserve the subjects in square crops; the red-fabric coastal photograph remains in the lower gallery. The studio image comes from the existing Hub content; the shop light and nine partner logos come from the existing Webflow asset inventory. The mockup's unverified AllyProof logo is omitted. The founder remains a portrait: the annotation mentions video but supplies no matching video source. No nonfunctional play control is shown.

All new theme rules are scoped to the Academy homepage. Course-page stacks, customer accounts, learning, administration, payment behavior, CMS schemas and the Hub design are unchanged.

At the desktop navigation breakpoint (1024 pixels and above), the homepage header uses a consistent 72% black surface before and after scrolling. The existing white logo, navigation colors, sticky positioning and scrolled border remain; mobile retains its existing treatment.

Inter 4.1 is self-hosted from the official rsms.me distribution with its OFL license. The variable webfont is subset to Latin, Cyrillic and relevant punctuation; real weights are used with font synthesis disabled. The homepage font variables do not change course or learning typography. Every direction has a subtitle, with the individual/corporate lines taken from their existing program content. Card gradients fade out on pointer hover and visible keyboard focus; reduced motion removes that transition.

Direction photographs ease to 1.065 over 1.8 seconds on hover or visible keyboard focus and settle back over 1.4 seconds. Titles rise 6 pixels with the same timing and easing, without scaling the type or changing its wrapping. Only the inner title span moves, preserving the full-card link/button target; subtitles and focus outlines stay stationary. A low initial velocity and long deceleration give the movement a soft, continuous feel; the gradient fades over 700 ms. The image stays clipped inside its unchanged frame. CSS transitions reverse from their current position when interrupted. Reduced-motion users receive no photo zoom, title movement or animated fade.

Below 900 pixels, or on devices without hover, the same active state follows the viewport's center line as visitors scroll. Cards return to rest after leaving that line; paired tablet cards activate together. A single IntersectionObserver handles the section without a scroll-event loop. It uses viewport-height pixel margins, rebuilds after resizing, and clears its state when reduced motion is enabled or the component unmounts. Fine-pointer hover is limited to desktop layouts so touch taps cannot leave a card stuck in its hover state. Keyboard focus remains available at every width.

## Public UI and course selection

The Academy hero now has a direct “Обрати навчання” action. A compact consultation section after the six directions offers help choosing a program through the existing inquiry flow. Course pages always expose a secondary path to details or package pricing without changing enrollment availability.

`academy-ui.css` scopes shared controls to public Academy pages: compact catalog headings and filters, consistent action shapes and touch targets, a learning-first mobile menu, readable inquiry fields, and grouped footer navigation. The tablet navigation gap is closed. Native dialogs retain keyboard handling and focus return, describe the inquiry context, and lock background scrolling without shifting the page. Approved photography, card motion, course content, and payment behavior are unchanged.

Local browser checks cover widths from 320 to 1440 pixels, short landscape screens, menu links, filter controls, dialog validation, Escape/focus return, and horizontal overflow. Architecture, TypeScript, formatting, the test suite, and the isolated static production build are required before staging activation.
