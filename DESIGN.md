# Pro Photo Academy — editorial gallery

The academy is a place to learn how to see. Its identity should demonstrate that ability before explaining it. The website combines a photographic exhibition with the clarity of a course catalog: expressive work, quiet controls, immediate choices.

## Research and interpretation

Reviewed October 7, 2026:

- [Locomotive / The Drake, 2025](https://locomotive.ca/en/work/the-drake-hotel): editorial hierarchy, strong photography, modular content and restrained transitions. Visually inspected the live homepage. Apply its image-led storytelling; use direct course links rather than a hero carousel.
- [Beaucoup / Bisous, June 2026](https://tympanus.net/codrops/2026/06/29/inside-bisous-designing-an-editorial-experience-for-cinematic-cgi/): a consistent column grid supports expressive imagery and precise labels. Apply the grid and restraint; the academy needs an immediately readable catalog, so it does not use the portfolio's fullscreen slider or cinematic loader.
- [basement / Rox, November 2025](https://basement.studio/post/rox-rebuilding-the-digital-presence-of-a-top-100-ai-company): a single structural idea creates identity across pages, instead of treating small effects as a design system. Apply photographic framing as the connecting idea.
- [Apple / Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/): keep content and controls separate; state changes and motion must preserve orientation. Apply this principle to navigation and dialogs, without imitating the material.
- [Nielsen Norman Group / Cognitive load](https://www.nngroup.com/articles/minimize-cognitive-load/): remove irrelevant decoration, repeated links and decisions users must remember. Apply one clear course route, concise card summaries and explicit enrollment states.

These are observations and project-specific interpretations, not a claim that every award-site convention improves conversion.

## Composition

The homepage leads with the course selected as Основна програма in Sanity. The current selection is Інста, яка продає. Its title, concise course introduction, format and duration lead to one direct course link. The red-fabric photograph supplies the dominant visual, using its editorial focal point and a localized dark scrim. The catalog action in the header is secondary. Mobile separates the photograph and copy so neither competes for legibility. A single quiet credit identifies the photographer. With no valid course selected, the general academy opening and underwater photograph remain available.

Immediately below, compact previews present the other featured courses with portrait thumbnails, title, audience, format, duration and price. The primary course is not repeated in this group. The current two alternatives use two equal columns on desktop and a list on mobile. The first alternative name remains visible in the initial desktop and mobile views. The catalog places the selected main course first while preserving the remaining editorial order and filter behavior. The full catalog uses larger photographs, with titles and factual metadata outside the image. Its cards omit the full program description, which belongs on the detail page. Custom programs show their format once, without repeating request-based availability, duration and pricing labels. No hover is required to find information.

Student work uses an editorial grid with natural image proportions. The learning section uses a numbered, linear structure. The founder story changes scale and pace with a portrait and short biography. Testimonials and custom training follow, then a direct consultation action. Course pages use their contextual enrollment controls instead of repeating the generic consultation block.

## Tokens

| Role | Value |
| --- | --- |
| Canvas | `#101211` |
| Surface | `#191C1A` |
| Raised controls | `#242824` |
| Primary text | `#F2EFE7` |
| Secondary text | `#B6BBB3` |
| Muted metadata | `#91988E` |
| Divider | `#343B33` |
| Input and outline-button boundary | `#6F7A6A` |
| Accent | `#D5E4B9` |
| Light editorial field | `#E9E6DC` with `#151A16` text |

Accent appears on primary actions and meaningful active states. Photography supplies the wider color range. No global photo filters, gradients used as decoration, or glass cards.

KyivType Sans 400/500, supplied with the academy's identity, is the display family. Manrope 400/500/600 is the functional family for body text, controls and metadata. Both are self-hosted with Ukrainian support. Titles have no terminal periods or decorative numbers; numbering appears only in lists where it conveys a sequence.

Display: up to 72 px desktop for the primary course, 76 px for the general opening, and 44/46 mobile homepage. Course landing: up to 60/65 desktop, 40/44 mobile. Section: 48/54 desktop, 32/38 mobile. Course: 26/32 full catalog, 20/26 compact preview. Body: 16/26. Intro: 18/28. Metadata: 12/18. Controls: 14/20 medium. Negative tracking applies only to large titles.

Container maximum 1360 px. Desktop gutters 48 px, tablet 32 px, mobile 20 px. A 12-column desktop grid supports 3 catalog items, 6/6 or 7/5 editorial compositions, and an 8/4 course-detail split. At 768 px the catalog becomes 2 columns, below that one. Course preview list remains vertically readable on mobile.

Spacing scale: 4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 128. Section intervals 112 desktop / 64 mobile. Photograph radius 4 px, preview tiles 12 px, form/dialog surfaces 16 px. Primary buttons use a pill shape and plain action labels. Directional arrows are reserved for previous/next controls in the photo viewer. Text links use a quiet underline; course cards use framing, title emphasis and hover/focus feedback. Image geometry connects the system across pages.

## Content discipline

Every visible element must help a visitor understand the offer, choose a program, assess its value, navigate, or act. Keep course audience, price, format, duration, meaningful availability, photographic attribution, form labels and errors. Remove ornamental section labels, image slogans, repeated headings, routine action arrows and repeated explanatory copy.

Sections have one descriptive title. The course-led homepage identifies the offer as a Pro Photo Academy course; the general fallback retains its academy descriptor. Course and supporting pages use direct titles. Ordinary navigation and actions use words. Icons remain where they identify an operation: open/close, filter, enlarge, previous/next or a real status. Internal navigation does not imitate an external-link arrow.

Supporting information sits beside the decision it clarifies. Page introductions do not repeat information already conveyed by the title and facts. The desktop header has one program entry through its primary course action; the mobile menu remains a complete navigation surface.

## Motion and interaction

Controls respond in 180 ms. Card lift and border feedback use 280–320 ms. Photographs use 700 ms with `cubic-bezier(.22,1,.36,1)`: a 1.035 resting crop, up to 1.055 on hover/focus, vertical scroll travel capped at 8 px, and pointer travel capped at 5 px horizontally / 3 px vertically. Travel also scales down with the image size so its frame never exposes an edge. Text and credits stay still. One observer tracks visible frames; a requested animation frame batches reads before writes only after scroll, resize or pointer input. There is no idle animation loop.

Course tiles lift 4 px, available package cards 5 px, and buttons 2 px on fine-pointer hover. Sold-out packages receive restrained 2 px feedback. Pressed controls scale to 0.98. Keyboard focus provides the same color, border and image treatment. Gallery images expose an enlarge affordance and transition between photos in 320 ms. Native details animate their content size in supporting browsers, retaining standard disclosure behavior elsewhere. Reduced motion removes travel, scale, entrance and disclosure transitions, including when that preference changes during a visit.

Offscreen editorial sections may reveal once by fading with 12 px translation; initially visible content is never hidden. No scroll hijacking, custom cursor, mandatory loader or looping decorative animation.

Keyboard focus is visible. Dialogs use native modal behavior, Escape and focus return. Course cards are single links. Forms use persistent labels and explicit errors. Enrollment packages compare in a consistent grid, and source conflicts produce inquiry actions. Sticky controls remain visually separate from editorial content.

## Conversion hierarchy after independent review

The full catalog starts with a concise heading, factual audience labels and course names above the photographs. Mobile keeps the type selector visible and expands secondary filters on request. Homepage previews use two columns at tablet widths and one on mobile.

Course introductions show starting price, format and duration. Packages immediately follow the introduction, ahead of outcomes and curriculum. On mobile they also precede the large photograph; inclusions expand inside compact cards. There is no pricing link directly before this section. One concise note beside the packages explains when the team must confirm prices and places. Unavailable packages have one clear status; other cards use their action to communicate enrollment or inquiry. A fixed enrollment bar appears only after the introductory action leaves the viewport. One global scroll offset accounts for the sticky header.

Checkout uses a compact mobile thumbnail, selected program/package and price, with expandable inclusions. Associated field errors preserve entered values. Declined or canceled orders offer a retry retaining the selection. Unverified legacy prices and dates remain explicit inquiries.

An optional package comparison dialog presents all tiers on desktop. Mobile compares two tiers in full-width paired columns and offers tier selectors only when there are more than two packages. Each comparison retains the correct availability and direct enrollment/inquiry action; entering an inquiry preserves the chosen package. Outcome list numbers sit beside their copy in compact rows.

Implementation references: [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), [native details content transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::details-content).

## Verification

Inspect 360, 390, 768, 1024 and 1440 px widths; check enlarged text, touch targets, overflow, image focal points, keyboard navigation, reduced motion, inquiry and checkout states. The first course name must be visible at 390×844 and 1440×900. Screenshot review is required; passing a build is not visual approval.

Focus refinement verified on October 7, 2026: no decorative action arrows on the homepage, no horizontal overflow at 360/390 px, visible course choices in the initial 390×844 and 1440×900 views, mobile menu navigation, package comparison, inquiry context and production build.

Primary course verification on October 7, 2026: the course title and direct action are visible at 390×844, alongside the first alternative program; 1440×900 shows both alternatives. Catalog order, direct course navigation, five selection/fallback tests, migration references and GROQ projection (legacy/native IDs and cleared selection) passed. Reviews use the course-specific heading only when a confirmed course reference exists.
