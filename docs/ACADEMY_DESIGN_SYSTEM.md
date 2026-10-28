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

## Composition

- Public pages use bounded 1440px content, responsive gutters and deliberate square-corner photography. Catalog rows align instead of staggering. Course facts and package decisions precede a large photograph on phones; the first available package price and action should be visible at 390 × 844.
- Package cards use aligned title, price and action rows. The authored featured package uses the elevated neutral surface, a stronger border and “Найпопулярніший”; availability remains independent of emphasis. Mobile comparison places this label above the table and starts with BASE and the featured tier. See [pricing rules](PRICING.md) for amounts and inquiry-only boundaries.
- Course heroes reuse the original `PhotoStack` carousel: up to five deduplicated photographs, starting with the program image and its authored student work, then existing editorial fallbacks. Keep the angled print frames neutral, the active credit readable and previous/next controls at least 44px. Click, keyboard and swipe navigation remain available without autoplay. Below 1024px, packages precede this gallery. The current homepage composition stays unchanged.
- Course overviews follow one vertical reading path: outcomes, audience, then curriculum, with headings above their content. Outcomes are unnumbered 20px statements in two columns (18px in one column on phones). A quiet surface groups the audience in three columns on wide screens and divided rows below 1024px. Native curriculum disclosures span the full width, with 24px insets, a subtle open state and 80px rows (16px insets and 72px rows on phones). Use 64px between sections, 48px on phones. Avoid nested summary grids or isolated headings beside long accordions. Keep the mobile enrollment bar and package section as the enrollment destinations.
- Inner-page public headers stay in document flow, with 72% black desktop backgrounds. Only the homepage overlays its hero. Checkout and order status keep reduced navigation.
- Login, checkout, legal content and status screens use quiet reading/form widths. No decorative animation competes with a transaction or error.
- The student dashboard has one prominent resume/start action. Upcoming meetings are shown only when available. Purchase history, settings and additional courses remain secondary.
- Lessons retain the 300px curriculum, 64px header, mobile contents drawer and safe-area-aware bottom controls. Reading remains Source Sans 3 at 18px/1.7 with a 42rem measure and the existing editorial spacing. Source diagrams and photographs are still and preserve their complete content.
- Administration retains its navigation, course outline and focused material editor. Save/publish status and media previews stay visible. Neutral selected rows, consistent insets and clear action hierarchy replace decorative surfaces; authorization and confirmation behavior is unchanged.

## Photographic motion

`CardMotion` is mounted once by the public Academy shell. Only cards marked `data-card-motion` participate; `data-card-photo` identifies the clipped photo frame and `data-card-title` identifies an inner text span. Do not transform a full-card link's containing block or its focus outline.

Photographs scale to 1.065 and titles rise 6px over 1.8 seconds, returning over 1.4 seconds. Fine-pointer hover and visible keyboard focus activate the effect; below 900px or without hover, the viewport center activates cards or a tablet row. Reduced motion disables movement. The observer handles route changes and filtered card lists, disconnects on cleanup, and ignores stale callbacks. Legacy photographic panning skips Academy surfaces so effects do not stack.

## Verification and delivery

Check public, conversion, student, lesson and administrative journeys at 360, 390, 768, 1024 and 1440px. Include keyboard-only navigation, reduced motion, enlarged text, long Ukrainian titles, loading/empty/error states, dialogs and media previews. Save screenshots under ignored local output directories. Compare the homepage and Hub to ensure the redesign did not change their approved composition or excluded theme.

Preserve catalog query contracts, program/order URLs, real package availability, guest checkout, disabled-payment notices, authorization, quiz-only completion, private media and preview isolation. No schema or service API migration is part of this presentation change.

Run architecture, formatting, TypeScript, relevant tests, the full suite, the production build and the validated synthetic Pages export before release. Commit verified milestones. Local preview and review export do not publish a live release; deployment uses the existing independent release process and retention rule.
