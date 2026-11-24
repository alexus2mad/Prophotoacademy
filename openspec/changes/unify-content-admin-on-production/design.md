## Context

Editor storage (`storage/config.ts`) chooses its marketing project from the installation's environment. Images, uploads, the photo library, validation and the store all call `marketingClient()` and `marketingImagePrefix()`. Production already reads staging's published pages anonymously for the sync. The review mockup (variant D) defined the two-pane list. Its preview reuses the editor's admin-only `?site-editor-preview=1` rendering. Pages allow same-origin framing only.

## Decisions

- **Request-scoped target.** `storage/target.ts` keeps the editor target in `AsyncLocalStorage`. `withEditorTarget('staging', fn)` makes `marketingClient`, `marketingImagePrefix`, `marketingWriteToken` and `marketingDatasetConfigured` resolve to staging project `3k86g5dt`, dataset `production` and `SITE_EDITOR_STAGING_WRITE_TOKEN`. Store, media, library and validation code need no environment parameter, and a request cannot mix targets. Outside a staging scope every function behaves exactly as before.
- **Availability.** The staging target is available only when `contentSyncRole()` is `production`, the staging writer is set and it differs from every other credential. Otherwise `stagingTargetAvailable()` is false and staging requests return 404.
- **Transport.** Editor API requests carry `env=staging` as a query parameter (GET, image upload) or a body field (JSON POST). The preview iframe uses `?site-editor-preview=1&site-editor-env=staging`. `readSitePage` enters the staging scope only for administrators on production. The sync keeps its anonymous staging reads and production writes.
- **Page list.** A pure `page-groups.ts` assigns sections: fixed paths for the service, information and legal pages, otherwise by kind (course, workshop), and other landings last. Summaries gain `updatedAt`, from Sanity `_updatedAt`, and `cover`, the first image field. On production the server loads both environments' summaries. The client merges them by path and asks the sync list which pages differ. A page only on staging appears with the Prod state «Немає».
- **Components.** `SitePageBrowser` (organism) owns selection, search and the mobile list/detail switch. `SitePagePreview` (molecule) renders the scaled, script-free iframe with the device and version switches. `SiteContentEditor` shows the browser in place of the card grid, an environment badge in the editor header, and the staging banner on the staging installation. `SiteImageLibrary` and `SiteEditorPreview` receive the environment.
- **Publishing to Prod** opens the existing `SiteContentSync` confirmation for that page.

## Risks

- A staging page that uses a template production lacks fails production validation when opened from the main admin. The error is shown, and the staging editor remains for that case.
- Production holding a staging writer widens production's blast radius to staging content only. Staging remains unable to touch production.
- The release must add `SITE_EDITOR_STAGING_WRITE_TOKEN` to the production runtime. This changes the production runtime digest the release checks verify, so the release records the new digest explicitly.
