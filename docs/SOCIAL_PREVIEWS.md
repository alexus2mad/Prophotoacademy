# Branded social previews

The current Academy identity has a page-specific sharing image for each public
page. Private routes use a non-personal family image. Retained Studio/Shop and
Hub designs have their own artwork without adding links or changing indexing.

## Design

- Primary JPEG: **1200 × 630**; square companion: **630 × 630**
- Maximum **300,000 bytes per file**, sRGB, no transparency or animation
- Exact ProPhoto vector wordmarks, Roboto Condensed Bold headings and KyivType
  Sans supporting text; paper `#fbfbfb`, ink `#150b08`, accent `#eb423b`
- 56px wide-format and 40px square-format insets; no CTA-shaped decoration
- Photographic feature for the homepage, editorial text/photo layouts for
  programs, gallery sequences for the Academy and student work, quieter brand
  treatments for information and workspace routes
- Photograph crops are independently directed for wide and square formats.
  Keep faces visible. The About square preserves the complete portrait
- No prices, enrollment dates, availability, ratings or fabricated quotations
  embedded in long-lived images

`scripts/social-images/catalog.ts` is the authored artwork plan. Its selections
come from the existing public photography library and Studio design assets.
Food Photography's pasta example illustrates the subject; it does not claim to
be a result of that particular course. Private teaching media are never inputs.

The renderer is an offline Sharp composition, not a browser dependency or a
public image-rendering API. It uses the original Roboto TTF and a lossless decode
of the existing KyivType font. See its adjacent font provenance. All generated
JPEGs and the metadata manifest are committed so crawlers receive ordinary
static files without credentials, JavaScript, image optimization or CMS access.

## Coverage and metadata

The 33 artwork entries cover all 17 current indexable Academy URLs, both retained
unlinked designs, six safe private route families, and eight Hub routes. Each
entry has two variants. `/social/` is excluded from host rewrites and session
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

1. Update the authored card and use existing public source assets
2. Run `pnpm social:generate`; inspect every changed wide and square crop
3. Run `pnpm social:review` for all 66 images in the private, self-contained
   `.data/social-images/index.html` and six labeled review sheets
4. Run `pnpm social:check`, architecture, TypeScript and relevant tests
5. Run production and synthetic review builds. Both prebuilds validate the
   source fingerprint, all image hashes, dimensions and size budget
6. Check real HTML using Facebook/Telegram/WhatsApp/Viber crawler user agents;
   confirm anonymous GET/HEAD returns image/jpeg for every image URL
7. Deploy through the existing guarded release process, then request supported
   app refreshes and record which ones actually completed

Text inputs use LF-normalized fingerprinting so Windows and Linux checkouts
agree. Font and photograph bytes remain exact. Images are never regenerated
silently during deployment. `pages:validate` checks both OG variants and the
Twitter image against the actual exported files and prefixed URLs.
