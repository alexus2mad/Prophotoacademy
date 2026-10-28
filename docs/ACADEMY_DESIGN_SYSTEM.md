# Academy design system

The October 2026 homepage is the visual reference for the Academy. Public pages, login, checkout, accounts, lessons and administration share its identity, with quieter composition for tasks and reading. Hub, ps-booking and the embedded Sanity Studio retain their own presentation.

## Ownership and boundaries

`src/app/academy-theme.css` defines the brand foundation. Apply `academyThemeClassName` from the existing typography module to Academy shells; do not theme `body`, `:root` or shared components globally. The class includes the self-hosted Inter and KyivType font variables. Source Sans 3 remains independently owned by `readingFont` and the shared lesson renderer.

Public composition belongs to `academy-editorial.css` and `academy-ui.css`; the approved opening, direction grid and photographic homepage sections remain in `academy-design-home.css`. Workspace composition belongs to `learning.css` and `course-authoring.css`. Change the owning rules instead of appending a competing override theme. The same components render live and synthetic review routes.

## Tokens and hierarchy

| Purpose                     | Value                                                         |
| --------------------------- | ------------------------------------------------------------- |
| Canvas / surface / elevated | `#050505` / `#121212` / `#232323`                             |
| Text / secondary / muted    | `#FFFFFF` / `#BCBCBC` / `#A8A8A8`                             |
| Divider / control border    | `#333333` / `#888888`                                         |
| Primary action              | White pill, dark text, 48px minimum height                    |
| Secondary action            | Transparent pill, neutral border, white text                  |
| Input                       | 16px text, 48px minimum height, 8px corners, persistent label |
| Functional panel            | Subtle border, at most 12px corners                           |
| Spacing scale               | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px                    |
| Control transition          | 160ms, disabled for reduced motion                            |

Use KyivType Black for public editorial titles, Inter for long course names, supporting type and all workspace controls/headings. Public H1 is 40–64px, course H1 32–56px, workspace H1 30–40px. Supporting functional text is at least 14px. Use uppercase sparingly for short editorial titles, never as a blanket transformation of functional controls. No decorative section numbers, heading punctuation or repeated arrow icons.

Preserve meaningful success, warning, failure and destructive colors together with text. In particular, correct/incorrect quiz responses must remain visibly different. Branding must not neutralize instructional feedback.

Partner logos use their original Webflow brand assets at full opacity, without grayscale, inversion or tint filters. Keep authentic white wordmarks where that is the supplied dark-background variant. `src/lib/photography/home-clients.json` records each original asset URL; preserve the logos' aspect ratios, the existing grid and restrained sizing. Lay’s uses a 320px transparent WebP derivative because its source SVG embeds a large bitmap; retain the source URL when optimizing delivery formats.

## Composition

- The catalog opens directly into all six programs, without filters or a result counter. Keep the flagship first and the remaining CMS order. Legacy filter query parameters do not hide content. Live and static review use the same route and template.
- Catalog courses use horizontal rows: a 224px photograph, a title/audience/description column, and an aligned 256px date/price/action column. Prices are 32px; the single destination has a visible 48px-minimum action. Neutral surfaces and subtle borders group each offer. Below 1024px, place the heading first, then a 144px thumbnail beside the date and price, followed by the explanation, format and full-width action. Below 600px, the thumbnail is 96px and price is 28px. Do not restore oversized photographs above prices or white availability badges that compete with the action.
- Every course row shows its authored start date, including the year. `programSchedule` uses the Kyiv calendar day to distinguish upcoming, same-day and past starts. Past intakes say “Потік стартував”; completed events retain their actual date and completed state. Bespoke training starts by agreement; unknown dates remain explicitly unconfirmed. Never invent a new cohort date or hide historical intake dates behind an open-enrollment label.
- `--academy-content-max: 1472px` caps and centers Academy public content, the homepage composition, workspace and lesson shells, their headers, and course authoring. Preserve responsive gutters and narrower prose, forms and instructional reading widths. Fullscreen galleries and drawers remain viewport overlays; Hub and Sanity Studio retain their own layouts.
- Public pages use bounded 1472px content, responsive gutters and deliberate square-corner photography. Catalog rows align instead of staggering. Course facts and package decisions precede a large photograph on phones; the first available package price and action should be visible at 390 × 844.
- Package cards use aligned title, price and action rows. The authored featured package uses the elevated neutral surface, a stronger border and “Найпопулярніший”; availability remains independent of emphasis. Mobile comparison places this label above the table and starts with BASE and the featured tier. See [pricing rules](PRICING.md) for amounts and inquiry-only boundaries.
- Course heroes reuse the original `PhotoStack` carousel: up to five deduplicated photographs, starting with the program image and its authored student work, then existing editorial fallbacks. Keep the angled print frames neutral, the active credit readable and previous/next controls at least 44px. Click, keyboard and swipe navigation remain available without autoplay. Below 1024px, packages precede this gallery. The current homepage composition stays unchanged.
- Course overviews follow one vertical reading path: outcomes, audience, then curriculum, with headings above their content. Outcomes are unnumbered 20px statements in two columns (18px in one column on phones). A quiet surface groups the audience in three columns on wide screens and divided rows below 1024px. Native curriculum disclosures span the full width, with 24px insets, a subtle open state and 80px rows (16px insets and 72px rows on phones). Use 64px between sections, 48px on phones. Avoid nested summary grids or isolated headings beside long accordions. Keep the mobile enrollment bar and package section as the enrollment destinations.
- Inner-page public headers stay in document flow, with 72% black desktop backgrounds. Only the homepage overlays its hero. Checkout and order status keep reduced navigation.
- Login, checkout, legal content and status screens use quiet reading/form widths. No decorative animation competes with a transaction or error.
- The student workspace uses a 188px navigation rail above 1024px and horizontal navigation below it. The dashboard starts with a short heading and one prominent resume/start action. A compact course header pairs its title with a square 176px photograph (72px on phones); progress, the next lesson and access terms stay readable together. Additional courses use secondary actions. Actual upcoming meetings use a compact row below the course rather than a competing tall panel. Purchase history uses labeled receipt rows and settings a bounded 680px form, with 32px panel padding on desktop and 24px/20px on phones. These layouts share live and synthetic demo components.
- Lessons retain the 300px curriculum, 64px header, mobile contents drawer and safe-area-aware bottom controls. Reading remains Source Sans 3 at 18px/1.7 with a 42rem measure and the existing editorial spacing. Source diagrams and photographs are still and preserve their complete content.
- Instructional images begin authorized loading three viewport heights before entering view, in either scroll direction. Pending image observers adapt to viewport resizing; admitted images load immediately and stay admitted. Preserve image dimensions, private media authorization and the independent quiz-only completion rule. Do not issue URLs for every image in a long lesson at once.
- Student curriculum groups and their lecture titles stay visible. The current lecture is bold and its title is a native disclosure for its chapter anchors, closed by default. Only the user's disclosure action opens those chapters; progress and chapter-focus updates never expand them. Native open state lasts while mounted, and navigating to another lecture starts with its chapters closed. Inactive lectures remain direct navigation links without chapter lists. This does not change the author's course outline disclosure behavior.
- Administration retains its navigation, course outline and focused material editor. Save/publish status and media previews stay visible. Neutral selected rows, consistent insets and clear action hierarchy replace decorative surfaces; authorization and confirmation behavior is unchanged.

## Photographic motion

`CardMotion` is mounted once by the public Academy shell. Only cards marked `data-card-motion` participate; `data-card-photo` identifies the clipped photo frame and `data-card-title` identifies an inner text span. Do not transform a full-card link's containing block or its focus outline.

Photographs scale to 1.065 and titles rise 6px over 1.8 seconds, returning over 1.4 seconds. Fine-pointer hover and visible keyboard focus activate the effect; below 900px or without hover, the viewport center activates cards or a tablet row. Reduced motion disables movement. The observer handles route changes and filtered card lists, disconnects on cleanup, and ignores stale callbacks. Legacy photographic panning skips Academy surfaces so effects do not stack.

## Verification and delivery

Check public, conversion, student, lesson and administrative journeys at 360, 390, 768, 1024 and 1440px. Include keyboard-only navigation, reduced motion, enlarged text, long Ukrainian titles, loading/empty/error states, dialogs and media previews. Save screenshots under ignored local output directories. Compare the homepage and Hub to ensure the redesign did not change their approved composition or excluded theme.

Preserve program/order URLs, real package availability, guest checkout, disabled-payment notices, authorization, quiz-only completion, private media and preview isolation. No schema or service API migration is part of this presentation change.

Run architecture, formatting, TypeScript, relevant tests, the full suite, the production build and the validated synthetic Pages export before release. Commit verified milestones. Local preview and review export do not publish a live release; deployment uses the existing independent release process and retention rule.

## Catalog rationale

Keep essential comparison facts visible before a visitor opens a detail page: the offer, suitability, start, format, duration and price. The existing authored course description explains the product; do not replace it with unverified claims. Consistent positions make rows easier to scan. References: [Baymard product-list information](https://baymard.com/research-articles/product-listing-information) and [NN/g on cards and list scanning](https://www.nngroup.com/articles/cards-component/).
