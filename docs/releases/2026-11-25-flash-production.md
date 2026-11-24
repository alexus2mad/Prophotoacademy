# Flash without fear on production — 25 November 2026

At the owner's request, production received the two-format workshop code and
the Flash without fear page.

- Production moved from `0ebadc7` to `7930356`, then to `dc04519`. That revision
  copies staging photos from their authenticated raw originals. The first sync
  attempt stopped safely because the public Sanity image CDN re-encodes photos:
  a 168 KB WebP was served as a 205 KB JPEG. Runtime, payment, notification and
  nginx settings were unchanged at every step.
- The second attempt copied all 16 photos as exact originals but stopped before
  publication: the sync could not publish a path with no production document.
  An empty, unpublished production draft was created at `/flash-without-fear`,
  and the sync then published the staging page over it.
- The public page returns 200 and shows:
  - the date, time and address, «кількість місць обмежена» and the «Анонс» section
  - both live tickets: Офлайн 3 700 грн (previously 4 200) and Онлайн 2 500 грн
    (previously 3 000)
  - 16 photos from the production marketing project and no staging addresses

  It is indexable and has no horizontal overflow at 390 px. No ticket was bought.

- The production privacy policy and public offer were not synced.

Since then, `require-workshop-buyer-details` has deployed `9de62be` to both
environments, so the ticket cards now lead to a checkout page that collects buyer
details. `docs/HOSTING.md` records `9de62be` as active and `dc04519` as rollback.

Open follow-ups:

- Let the sync create a production page for a new path.
- Remove the unused re-encoded asset `flash-w13.webp`, pending the owner's
  decision.
- The release pipeline change: standalone output, direct transfer and GitHub CI.
