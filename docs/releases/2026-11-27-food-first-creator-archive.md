# Food first and Content Creator archived — 27 November 2026

At the owner's request, production was released before staging. Both run
`83fd33e52eaa3a0cf3378575c18d9d09989dd2e7`; the rollback on both is
`ee092c4eb3299455d3d06d3903e193df3ee8da0f`.

## Changes

- The Food course leads the course list and starts on 17 December.
- Content Creator is archived: delisted from course lists, the catalog, the
  sitemap and the page editor, with its data kept. `/content-creator`
  redirects temporarily (307) to the homepage. Restoration steps are in
  [the Content Creator design notes](../CONTENT_CREATOR_DESIGN.md).
- Every closed course shows «Доступно в записі» instead of «Набір закрито».

## Verification

The release used the existing isolated-builder flow. On each environment the
loopback candidate and then the public site passed these checks:

- health;
- the first `/academy` course links to `/food-product-photography`;
- no link to `/content-creator`, and «Доступно в записі» with no «Набір закрито»;
- the Food page has «Старт 17.12» and no 18 December date;
- `/visual-content` shows «Доступно в записі»;
- `/content-creator` returns 307 to `/`;
- the production sitemap lists Food and omits Content Creator.

Production payment mode stays `wayforpay` and staging stays `mock`.
