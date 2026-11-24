## 1. Domain

- [x] 1.1 Add the pure comparison and content rewrite with tests for new, changed and identical pages, image prefix normalization, staging links and rejected payment or staging addresses.
- [x] 1.2 Add the production-only staging reader, photo copy and page sync with tests for availability, digest and revision conflicts, asset ID verification and publication through production validation.

## 2. API and UI

- [x] 2.1 Add `GET/POST /api/admin/site-content/sync` with administrator, origin and availability checks and publication revalidation; cover denial, listing and publishing in route tests.
- [ ] 2.2 Add the `SiteContentSync` organism and the production and staging entry points in `SiteContentEditor`; cover the entry points, the loading state, change descriptions and the handoff address in markup tests, then check listing, warnings, confirmation, the `?sync=` deep link, desktop and mobile layout, keyboard use and focus in a browser on the released environments.

## 3. Documentation and checks

- [x] 3.1 Document the sync in `docs/site-content-editor.md`, map the route in `openspec/coverage.json`, and run `spec:check`, architecture, typecheck, formatting and the full test suite.

## 4. Release

- [ ] 4.1 Release one revision to staging and production through the guarded procedure, keeping each environment's payment mode, runtime and nginx digests; verify on production that the read-only sync list shows the Flash workshop and the two legal pages.
- [ ] 4.2 Record the release, then archive this change with the release change.
