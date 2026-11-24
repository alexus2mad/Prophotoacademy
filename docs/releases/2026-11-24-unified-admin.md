# One admin for staging and production — 24 November 2026

Source `0ebadc7d395e3559b13d89d146b6517143171416` is active on staging and
production; `3f0a7533ad7f3a07c2860d68e895c2f16b86e5f1` is the single rollback on
both (`6f57f41` and `75b7828` were pruned).

- The production admin at `/admin/content` manages staging and production
  content. Each page has a **Staging | Prod** switch, and editing, publishing,
  page creation and photo uploads act on the chosen environment.
- The page list is grouped by site section and shows each page's state on both
  environments. The selected page has a live, script-free preview with desktop,
  phone, draft and published views. Staging's version renders with production's
  templates.
- The staging editor remains for unreleased templates and links to the main admin.
- **Publish to Prod** still goes through the confirmed sync.

## Runtime change

At the owner's choice, production received `SITE_EDITOR_STAGING_WRITE_TOKEN`, a
server-side copy of staging's existing marketing writer for project `3k86g5dt`.
It was copied on the host without being printed. The original runtime file is kept
root-only at `/etc/prophotoacademy/runtime.env.before-unified-admin`. Revoking
that Sanity token also disables the staging editor; a dedicated token can replace
it later. Staging received no production credential.

## Verification

851 tests (six database-backed files passed serially after timing out under
parallel load), architecture (968 modules), TypeScript, OpenSpec validation,
coverage, agent rules, formatting and the 58-page Pages export passed. The local
learning sandbox verified the grouped list, selection and focus, desktop and
phone previews, the editor round trip and a 390 px layout.

The production candidate passed health, the food landing and anonymous editor
denial on a loopback port with the new runtime before activation. After
activation both environments passed health, login redirection, 401 for
signed-out editor and sync calls, landing pages and indexing headers. Payment
(live WayForPay on production, mock on staging), notification, nginx, marketing
project and all other runtime settings were unchanged apart from the added writer,
which is present, equal to staging's writer and separate from production
credentials.

In the production admin, the S/P states, a staging-only page previewed through
production's templates, a Prod-only view, a Prod preview and opening a staging
page in the editor were checked. Nothing was saved or published.
