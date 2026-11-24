## Context

Each environment's editor stores a page as a public `academySitePage` (`site-page-<sha256(path)>`) and a private working document. Staging's marketing project `3k86g5dt` serves published pages and image assets publicly, and production already reads its own published pages without a token. Production's image validation accepts only its own CDN prefix (`cdn.sanity.io/images/qy8emt0h/production/`). The staging startup guard rejects production CMS credentials.

## Decisions

- **Production pulls; staging hands over.** Only a production installation (`marketingDatasetConfigured()` with project `qy8emt0h`) can sync. It reads staging's published pages and asset metadata through an anonymous client pinned to `3k86g5dt/production`. The staging editor's **Опублікувати на проді** is a link to `https://prophotoacademy.com.ua/admin/content?sync=<path>`. This keeps the isolation guard intact and puts the confirmation under the production session. A server-to-server push would need a production write token on staging, which the guard forbids.
- **Publish on confirmation.** On the owner's decision, a confirmed sync publishes immediately through `writeSitePage(page, revision, true)`. It therefore reuses the template, field, image and ticket binding validation and the revision guard. Publishing clears an existing production draft, and the list warns beforehand.
- **Optimistic concurrency.** The list returns each staging page's content digest and the production revision. The sync request must repeat both, otherwise it fails with 409.
- **Comparison.** `compare.ts` is a pure function. Staging image URLs are normalized to the production prefix before comparing, so pages already synced show as identical. It reports added, removed and changed blocks by label. Pages present only on production are not listed and never deleted.
- **Photos.** Only file names matching `<hex>-<w>x<h>.<ext>` under the exact staging prefix are copied. Assets missing on production are downloaded from the staging CDN original (12 MB cap, image content type) and uploaded with their original file name. The Sanity asset ID derives from the bytes, so the upload must return the expected ID or the sync aborts before publishing.
- **Payment boundary.** Page content holds only `offerId`; the price and checkout link come from `workshop-offers.ts` and the server's `PAYMENT_MODE`. After rewriting, content that still contains `staging.prophotoacademy.com.ua`, the staging asset prefix or a `wayforpay.com` address is rejected.
- **UI.** A new `SiteContentSync` organism owns the list, the confirmation and the request state; `SiteContentEditor` shows the entry points. On staging the header link is disabled with a hint while the page has unsaved changes or an unpublished draft, because only the published version syncs.

## Risks

- A staging page built on a template newer than production's code would fail production validation. The release ships both environments from the same revision, and the error is reported in the list.
- Copying photos makes them public on production, as on staging. Managers already approve public-facing material before publishing on staging.
