## Why

Managers prepare and review marketing pages in the staging editor. Production has its own marketing project (`qy8emt0h`), so pages finished on staging, such as the Flash without fear workshop, never reach the public site unless someone rebuilds them by hand. On 24 November 2026 the owner asked for a sync in the admin editor, started from either environment, that publishes staging content to production.

## What Changes

- The production editor gains **Зміни зі staging**. It lists the staging pages that are new on production or differ from it, with the changed blocks, photos to copy and warnings. A manager publishes one page at a time to production after an explicit confirmation.
- The staging editor gains **Опублікувати на проді** for an already published page. It opens that page's sync confirmation in the production editor. The manager signs in to production there; staging never holds production credentials.
- Syncing copies the page's photos into the production marketing project, rewrites their URLs and any absolute staging links, then publishes through the existing production validation and ticket binding checks. A newer staging version or a production change made in the meantime stops the sync with a conflict.
- Payment configuration is never synced. Staging stays in mock payment mode and production keeps its live WayForPay merchant. A workshop page carries only its ticket binding, which production resolves through its own checkout. Synced content containing payment provider or staging addresses is rejected.
- Production pages without a staging counterpart are never deleted. A page that differs only on production, such as the legal pages, is overwritten only when a manager explicitly publishes it from the list.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `site-page-editing` gains a requirement for staging-to-production publication from the editor.

## Impact

`src/lib/site-editor/sync/`, a new `api/admin/site-content/sync` route, the `SiteContentEditor` organism and a new `SiteContentSync` organism, the editor guide and the coverage index. No change to runtime environment files, payment settings, staging isolation, or the staging marketing data.
