## 1. Environment target

- [x] 1.1 Add the request-scoped editor target and staging availability; test project, token, image prefix and validation resolution in both scopes and refusal when unavailable.
- [x] 1.2 Accept `env=staging` in the editor page, image and preview paths; test that staging reads and writes reach only the staging project and that staging requests are refused off production.

## 2. Page list

- [x] 2.1 Add section grouping and summary dates and covers; test grouping of every seeded page and a new landing.
- [x] 2.2 Add `SitePageBrowser` and `SitePagePreview`, the environment badge and the staging banner; test markup for groups, states, switches, preview addresses and the banner.
- [ ] 2.3 In a browser, check selection, switches, staging preview, editing a staging page, the publish-to-Prod handoff, keyboard focus and a 390 px layout. Locally verified on 24 November in the learning sandbox (single environment): grouped list, selection with heading focus, live desktop and phone preview, editor round trip keeping the selection, and the 390 px list/detail switch without overflow. The Staging | Prod switch needs the production staging writer and is checked after release.

## 3. Documentation and checks

- [x] 3.1 Update the editor guide and coverage index; run OpenSpec checks, architecture, typecheck, formatting, the full test suite and the Pages export.

## 4. Release

- [ ] 4.1 Add `SITE_EDITOR_STAGING_WRITE_TOKEN` to the production runtime, release one revision to both environments and verify that payment, notification and nginx settings are unchanged and staging content is editable from production.
