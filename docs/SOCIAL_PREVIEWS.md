# Branded social previews

The current Academy identity has a page-specific sharing image for each public
page. Private routes use a non-personal family image. Retained Studio/Shop and
Hub designs have their own artwork without adding links or changing indexing.

## Brief for a new page

Start with three things from the approved page: its exact public path, the name a visitor should remember, and a public photograph that shows what makes the page distinctive. For a workshop, look first at its cover and examples from its gallery. Choose a frame where the subject remains recognizable beside the lower-left headline in both formats. Record the image's source and any credit restrictions when adding an asset to the project.

Add one entry to the [artwork catalog](../scripts/social-images/catalog.ts). The AI Artwork workshop shows how its category, event name and supporting line work together. Its flower portrait uses `60% 50%` in landscape and `48% 50%` in square. [Approved wide JPEG](../public/social/ai-artwork-205f9ab518f4-wide.jpg) · [Approved square JPEG](../public/social/ai-artwork-24b97154038b-square.jpg)

| Input | Authoring decision |
| --- | --- |
| `path`, `brand` | Use the canonical relative path. Academy is the default wordmark. Hub and Shop use their respective lockups. |
| `title`, `description` | Supply a readable Ukrainian sharing title and description grounded in the page. Retain an official English event name. |
| `lines`, `label`, `subtitle` | Break the uppercase headline into readable phrases. Use the same lines in both formats. Add a category only when it clarifies the page and a short supporting line with one useful detail. Keep the offer, schedule and live availability on the landing page. |
| `photos` | Pick one approved photograph under `public/images/` or `public/design/`. Set `src` to its public path and `alt` to an accurate description of the actual subject. Choose a high-resolution source. Private lessons and account records belong outside this library. |
| `position`, `squarePosition` | Set each cover crop using `x% y%` along the image's surplus width and height. The square inherits `position` unless overridden. Inspect both crops for cut-off heads, hands or equipment that explains the workshop. |

## Composition

In the approved cards the photo extends to all four edges. The upper-left wordmark identifies the publisher. The red rule, optional category, headline and subtitle form one lower-left group. A reader should recognize the same page when an app chooses a different aspect ratio. Keep the photo, text order and line breaks consistent, then adjust the crop and type fit for each canvas. Information and private pages without suitable public photography use the quiet brand-mark background.

| Renderer setting | Wide | Square |
| --- | ---: | ---: |
| JPEG canvas | 1200 × 630 | 630 × 630 |
| Left, top and bottom safe inset | 56px | 42px |
| Monochrome vector wordmark width | 334px | 272px |
| Maximum copy width with a photograph | 650px | 546px |
| Roboto Condensed Bold headline starting size | 96px, or 84px for three lines | 76px, or 70px for three lines |
| Headline row gap / gap before subtitle | 7px / 24px | 5px / 20px |
| KyivType Sans category / subtitle starting size | 19px / 26px | 17px / 23px |
| Accent rule | 48 × 4px | 37 × 4px |

The renderer fits all headline lines at a common size. Paper-white lettering (`#fbfbfb`) and the red rule (`#eb423b`) are the visible graphic elements over the photo. A soft top gradient protects the wordmark, and a separate lower gradient follows the copy. In the wide card the lower shade falls away toward the right so the photography can carry that space. The renderer increases the shade until the minimum contrast underneath solid text and logo strokes reaches 4.5:1. Visual review covers composition and the visibility of the subject.

Keep the domain in the link preview supplied by the platform. One wordmark identifies the publisher. Reserve buttons, pricing and signup instructions for the actual page. Export flat sRGB JPEGs within **300,000 bytes per file**. [Design review and release record](releases/2026-11-14-social-artwork.md)

The renderer is an offline Sharp composition, not a browser dependency or a
public image-rendering API. It uses the original Roboto TTF and a lossless decode
of the existing KyivType font. See its adjacent font provenance. All generated
JPEGs and the metadata manifest are committed so crawlers receive ordinary
static files without credentials, JavaScript, image optimization or CMS access.

## Coverage and metadata

The catalog covers Academy marketing pages, the retained designs, safe private
route families and Hub routes. Each entry has two variants. `/social/` is excluded from host rewrites and session
refreshes. Existing account authorization and noindex policies remain intact.

`src/lib/social-images/metadata.ts` supplies complete OG metadata and Twitter
large-card parity. It preserves the Pages repository prefix once, strips
tracking/query fragments, and uses an own-property lookup. Private route keys
normalize to a generic family; supplied titles, descriptions and paths are
ignored there so email, order tokens and lesson names cannot enter previews.
Unknown new public slugs receive the generic branded fallback until an artwork
entry is authored. Fixture content coverage fails validation if a known page
is omitted. CMS SEO titles/descriptions still control the page metadata.

Social images use content-addressed filenames and immutable HTTP caching.
Changing the artwork creates a new image URL. Existing live hashed files should
be retained when later artwork changes, so cached page previews can still fetch
their previous image. Never overwrite an existing hash with different bytes.

## Facebook, Telegram, WhatsApp and Viber

The primary image uses the common landscape sharing format; the second OG image
is a square companion. Apps choose their own presentation and may ignore the
second image. This is not user-agent image swapping. Alt text, dimensions, MIME
type, canonical URL, title and description are explicit. Both variants remain
well below the conservative project file-size budget.

Next's default HTML-limited crawler list is preserved and extended with Telegram
and Viber. These crawlers receive complete metadata in the HTML head rather than
depending on streamed metadata. This behavior is checked over HTTP with the
four crawler user agents, not inferred from browser hydration.

References: [Open Graph structured image properties](https://ogp.me/#structured),
[Next metadata and crawler handling](https://nextjs.org/docs/app/getting-started/metadata-and-og-images),
[Meta Sharing Debugger](https://developers.facebook.com/tools/debug/),
[Telegram preview modes](https://core.telegram.org/constructor/messageMediaWebPage),
[WhatsApp preview privacy setting](https://faq.whatsapp.com/445453537819972/).

Image cache invalidation and page-preview refresh are different. New filenames
avoid reuse of old image bytes after a page is fetched again. Facebook provides
its signed-in debugger/batch invalidator; Telegram has a webpage-preview bot.
Record actual refresh responses. Do not report that changing filenames purged
an app's page cache, that a local crawler check proves app rendering, or that
previously sent messages were updated. No universal operator purge is assumed
for WhatsApp or Viber; user preview settings can also suppress previews.

## Editing and verification

1. Add the catalog entry and approved source. Ensure the route builds social metadata from its own public path, including when the page was authored in the visual editor.
2. Run `pnpm social:generate`, `pnpm social:check` and `pnpm social:review`. The local proof is `.data/social-images/index.html`. The numbered sheets pair a 600 × 315 wide preview with a 315 × 315 square preview.
3. Inspect both cards side by side at thumbnail size, then open both JPEGs at native size. Read the title without zooming. Check the face or distinguishing detail, Cyrillic glyphs, wordmark clearance and gradient transitions. A poor crop calls for a new focal position or source photo. A headline that shrinks too far calls for a shorter phrase or different line break. Regenerate and inspect both again.
4. Review the diff. A new page should contribute its JPEG pair, catalog entry, updated manifest and fingerprint. Confirm existing page hashes stay stable for a page-only addition. Keep previously issued files addressable.
5. Run the relevant tests and review builds. Check the deployed page's original HTML for the ordered landscape and square OG URLs, image types, dimensions, alt text and the landscape Twitter image. Fetch both images anonymously and compare the bytes with the manifest. Repeat the HTML check with the Facebook, Telegram, WhatsApp and Viber crawler user agents.
6. The staging review gallery is a separate static artifact. To update it in an authorized staging release, follow the [gallery publication guide](STAGING_SOCIAL_GALLERY.md). A refresh of an app's cached preview is a separate operation.

Text inputs use LF-normalized fingerprinting so Windows and Linux checkouts
agree. Font and photograph bytes remain exact. Images are never regenerated
silently during deployment. `pages:validate` checks both OG variants and the
Twitter image against the actual exported files and prefixed URLs.
