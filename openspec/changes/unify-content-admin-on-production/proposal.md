## Why

Managers maintain marketing pages in two admins: staging, to prepare and check pages with test payments, and production, for the live site. Its page list shows identical cards that are hard to tell apart. On 24 November 2026 the owner asked for one admin, on production, that manages staging and production content. They chose these terms:

- Staging remains the pre-release stage: edit and publish to Staging, check, then publish to Prod.
- Staging's own editor stays for templates production does not have yet, with a pointer to the main admin.
- The page list becomes two panes (variant D of the review mockups): a grouped list beside the selected page's details and a live preview. The preview shows staging's version through production's own renderer.

## What Changes

- **Environment switch.** On production, each page has a **Staging | Prod** switch. Opening, saving, publishing, creating pages, uploading photos and browsing the photo library act on the chosen environment's marketing project. Publishing to Staging updates the staging site and never the production site.
- **Two-pane page list.** Pages are grouped by site section: Головна та Академія, Курси, Воркшопи, Навчання на замовлення, Студія, магазин та AI, Про академію, Юридичні документи and Інші сторінки. Each row shows the page's state on both environments, including a page that differs from staging or exists only there. The detail pane shows address, type, state per environment and last change. It has a live preview with **Комп’ютер / Телефон**, **Чернетка / Опубліковано** and **Staging / Prod** switches, and actions to edit in either environment, open the public page and publish the staging version to production.
- **Staging preview on production.** An administrator-only preview mode renders a staging page, draft or published, with production's templates. Nothing is published.
- **Publish to Prod.** The existing sync remains the only way staging content reaches production, with the same confirmation, photo copy, address rewriting and payment boundary.
- **Staging editor.** It keeps working for unreleased features and shows a banner linking to the main admin for the same page.
- **Credentials.** Production receives a server-only staging marketing writer (`SITE_EDITOR_STAGING_WRITE_TOKEN`) for project `3k86g5dt`. Staging still receives no production credential, and payment configuration stays per environment (production live WayForPay, staging mock).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `site-page-editing` adds staging content management from the production admin, the two-pane page list with live preview, and the staging editor's pointer to the main admin.

## Impact

- Editor storage configuration: a per-request target environment.
- Editor API routes and the preview path of public routes.
- The `SiteContentEditor`, `SiteImageLibrary` and `SiteEditorPreview` components, plus new page-list and preview components.
- The editor guide, the coverage index and the production runtime configuration (one new secret at release).
- No change to staging isolation, payment settings, learning data or the public rendering of published pages.
