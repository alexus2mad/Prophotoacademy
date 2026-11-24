## Why

On 24 November 2026 the owner asked to deploy the branch to staging and production. They then asked to hold that release and ship it together with the staging-to-production content sync (`sync-site-content-to-production`) in a single release. Production runs `75b7828` and staging runs `6f57f41`. The release delivers already-specified, verified changes and records them.

## What Changes

- Staging and production both move to the branch revision that completes `sync-site-content-to-production`. The `80e193b` candidates built earlier were discarded unactivated.
- Production gains the behavior staging already verified: the editor's intensive workshop blocks with direct hosted WayForPay ticket checkout (`author-workshop-intensive`), workshop gallery and listing fixes (`fix-workshop-gallery-and-listing`), the Flash workshop sharing cards (`author-flash-workshop-social-artwork`), editor agent guidance and the mandatory OpenSpec agent rule. Both environments gain the content sync.
- Each environment keeps its runtime configuration, payment mode (production `wayforpay`, staging `mock`), marketing editor project and nginx configuration. Exactly the active release and one verified rollback are retained per environment.
- No page content is copied by the release itself. The owner publishes staging pages to production through the new sync.
- `docs/HOSTING.md` and a release note record the active and rollback SHAs.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The release delivers requirements specified by the changes above, so `skip_specs: true` is declared.

## Impact

The production and staging application releases and the release documentation. No database migration and no change to the environment, proxy or Sanity configuration.
