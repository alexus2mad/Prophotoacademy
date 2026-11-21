# Admin site content editor

Administrators open **Сторінки сайту** in the Academy workspace at `/admin/content`. Search by Ukrainian title or public path. Choose a section, change its copy or replace a photograph, and enter descriptive alternative text wherever that image conveys information. The desktop and phone buttons change the width of the actual page preview.

**Зберегти чернетку** saves a private version. Check the result in the preview, then use **Опублікувати** to make it visible at the same public address. Leaving an unsaved edit prompts for confirmation. A revision conflict keeps local changes visible so the editor can copy their work before loading the newer version.

Use **Створити сторінку** for a new course presentation, workshop or standalone landing. Choose its address before creating the draft. Fill in the opening section and add editorial sections as needed. Published course and workshop presentations appear in the corresponding Academy lists. Existing program enrollment, tickets, prices and payment eligibility continue to use their configured offers. Creating a promotional page alone does not create a purchasable product.

## Storage and activation

| Setting | Purpose |
| --- | --- |
| `NEXT_PUBLIC_ACADEMY_DESIGN=studio` | Active Academy design used by the visual editor and its preview. Set before building the public app |
| `SITE_EDITOR_MODE=readonly` | Default. Render the initial page inventory and allow administrators to inspect it |
| `SITE_EDITOR_MODE=local` | Development or the local learning sandbox. Drafts, published pages and WebP images persist together under `.data/site-editor` or `SITE_EDITOR_LOCAL_DIR` |
| `SITE_EDITOR_MODE=sanity` | Use the public marketing project and dataset configured with `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` |
| `SANITY_API_WRITE_TOKEN` | Server-side credential with draft, document and image write access to that marketing dataset |
| `SANITY_API_READ_TOKEN` | Optional server credential for published reads when the dataset requires authentication |

The private learning dataset and student records are managed separately. Keep the marketing writer scoped to its intended dataset. The GitHub Pages export uses the initial documents with its read-only adapter. Public editorial image uploads become public marketing assets by URL, including while the containing page is a draft. Use private course authoring for paid lesson media.

1. Set the marketing dataset and server credentials on staging. Verify it is the intended dataset. Configure the editor independently of `CONTENT_MODE`, which selects the existing catalog and offering data.
2. From a trusted source checkout, run `pnpm site:seed` to inspect the inventory. Run `pnpm site:seed --write` with the intended marketing dataset credentials to initialize published documents. Repeating the command preserves existing documents and drafts. Runtime release directories contain compiled files.
3. Apply the request size settings in the supplied nginx environment template so authenticated administrators can upload images up to 10 MiB. Uploads are decoded and normalized to WebP. Restart the app after setting its environment.
4. Sign in with an existing Academy administrator. Make a draft edit, check its phone and desktop preview and verify the published page in a signed-out browser. Publish only approved changes. A new course or workshop still needs a separately configured offer for sales.
5. Repeat the verified activation on the production marketing dataset as a separate release. Returning the editor to readonly switches rendering back to the initial inventory. Existing Sanity documents remain available when Sanity mode is re-enabled.

For a local rehearsal, `pnpm sandbox:learning` uses its existing synthetic administrator and isolated marketing storage. Open `http://127.0.0.1:3200/admin/content`. Local sandbox credentials are listed by the command. Data survives a sandbox restart.

## Maintenance

Page documents use stable section and field IDs. Keep IDs stable when changing labels or rendering. The same initial values populate the editor and the default presentation. A saved document overlays these slots within the existing design. Public reads use published records. The preview checks the signed-in administrator and applies its draft only to the requested path.

Public marketing templates, new page discovery, sitemap handling, authenticated API routes, and the review export are covered by the site-page-editing specification. Keep page authorship separate from learning, access and payment administration.
