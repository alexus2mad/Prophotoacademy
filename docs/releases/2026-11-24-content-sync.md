# Workshops and staging content sync — 24 November 2026

Source `3f0a7533ad7f3a07c2860d68e895c2f16b86e5f1` is active on staging and
production. Staging moved from `6f57f41`; production moved from `75b7828` and
gained the 25 commits staging had already verified:

- Intensive workshop blocks and direct hosted WayForPay ticket checkout
  (`author-workshop-intensive`), workshop gallery and listing fixes, and the Flash
  workshop sharing cards.
- Editor agent guidance and the mandatory OpenSpec rule for every agent.
- **Staging-to-production content sync** (`sync-site-content-to-production`): the
  production editor's **Зміни зі staging** list and the staging editor's
  **Опублікувати на проді** handoff. See the
  [editor guide](../site-content-editor.md#як-перенести-сторінку-зі-staging-на-прод).

The release copied no page content. Production still has no
`/flash-without-fear` page (HTTP 404); the owner will publish it through the sync
after changing it on staging. On release day the production sync list showed
three differences: Flash without fear (new, 16 photos, ticket 4 200 грн) and the
privacy policy and public offer, whose production texts differ from staging.
Sixteen pages were identical.

An `80e193b` candidate built earlier was discarded unactivated when the owner
asked to ship it together with the sync.

## Verification

840 tests, architecture (958 modules), TypeScript, OpenSpec validation, coverage,
agent rules and the 58-page Pages export passed. Six database-backed test files
timed out under parallel load in the first full run and passed serially with
unchanged assertions.

The production candidate passed health, the food landing and anonymous editor
denial on a loopback port before activation. After activation both
environments passed health, editor login redirection, 401 for signed-out editor
and sync API calls, landing pages and indexing headers. Production's runtime,
payment, notification, nginx and marketing editor digests were unchanged:
production keeps live WayForPay and staging keeps mock payments.

In the browser, the production sync list, its inline confirmation, the
`?sync=` handoff from staging and a 390 px layout were checked. Every
confirmation was cancelled; nothing was published.

Staging retains `6f57f41` and production `75b7828` as the single rollback;
`715cfea` and `b081a5d` were pruned. Builder and transfer copies were removed.
