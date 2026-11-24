## Why

On 24 November 2026 the owner asked to release the code to production along with the new workshop. Production runs `0ebadc7`. Staging runs `7930356`, verified with the two-format Flash workshop and its «Анонс із цінами» section.

## What Changes

- Production moves to `7930356`, the same application revision as staging: several workshop ticket formats, the announcement block and phone-friendly cover facts.
- The Flash without fear page is published to production through the existing confirmed sync. It copies its photos and starts live WayForPay ticket sales: Офлайн 3 700 грн and Онлайн 2 500 грн.
- No other staging page is synced. The production privacy policy and public offer stay as they are.
- **Fix found during the release.** The first sync attempt stopped safely: the public Sanity image CDN re-encodes photos according to request headers (a 168 KB WebP was served as a 205 KB JPEG), so the copied asset no longer matched the original. The sync now downloads authenticated raw originals with production's staging writer, checks each file's SHA-1 against its asset name before upload, and still verifies the resulting asset ID. Both environments move to the revision with this fix.
- `docs/HOSTING.md` and a release note record the change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The release delivers the archived `flash-workshop-two-formats` and `sync-site-content-to-production` requirements, so `skip_specs: true` is declared.

## Impact

The production application and its Flash page. Runtime, payment, notification and nginx settings are unchanged; production keeps live WayForPay.
