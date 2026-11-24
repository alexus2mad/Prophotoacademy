## Why

On 24 November 2026 the owner asked to change the Flash without fear workshop on staging.

- **Date and location.** Add «13 грудня, 11:00–17:00, Київ, вул. Саксаганського, 24/25».
- **Group size.** Replace «до 6–7 учасників» with «кількість місць обмежена».
- **Two formats.** Sell an offline ticket for 3 700 грн (previously 4 200) and an online ticket for 3 000 → 2 500 грн. The online format is a live stream at the same time.
- **Presentation.** Show both prices at the top as in the owner's design and offer two purchase cards in the buy section, like other workshops.

Editor workshops currently allow exactly one ticket package, and checkout always charges the first package.

## What Changes

- An editor workshop offer may define several ticket packages, each with an optional previous price shown struck through. The Flash offer defines two:
  - **Офлайн:** 3 700 грн, previously 4 200. Package ID `flash-without-fear-ticket`, kept for continuity.
  - **Онлайн:** 2 500 грн, previously 3 000. Package ID `flash-without-fear-online`, a live stream on 13 December, 11:00–17:00 Kyiv time.
- Workshop checkout charges the requested package, using its server price. Unknown packages are refused as before.
- When a workshop has more than one ticket:
  - **Hero:** two price cards in the owner's design. Offline is filled, online outlined. Each shows the old price struck through and the new price, and starts its own checkout.
  - **Introduction:** both prices.
  - **Buy section:** one card per ticket, with its description, what is included and its own «Записатися».
  - **Mobile action:** leads to the price cards.

  The editor shows all bound prices, and the production sync warning lists them. Single-ticket workshops are unchanged.

- **Announcement block (added 24 November after the owner's review).** The first cover cards were smaller than the design and placed in the cover. A new editor block, «Анонс із цінами» (`intensive-announcement`), follows the AI Artwork announcement layout. It has an eyebrow, a title, a subtitle, a date-and-time pill, the price cards in the owner's discount design and a line under the prices. The cards are large and centred, offline filled and online outlined, with a lowercase format label, the old price struck through, a large price and raised «грн». When a workshop has this block, the cover leads to it with «Обрати формат». On the Flash page the block follows the cover.

- **Staging page content** (no code): the date-and-location fact; «кількість місць обмежена» in place of «до 6–7 учасників» in the hero, introduction, format list and ticket note; and the format list's price line updated to the two prices. The page is published on staging only.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `checkout-and-fulfillment`: hosted workshop payment supports several priced packages per workshop.
- `site-page-editing`: editor workshops present several tickets with previous prices.

## Impact

`src/lib/commerce/workshop-offers.ts` and its types, the workshop checkout route, workshop ticket presentation, the workshop template and its intro and offer blocks, the checkout action, the editor inspector and ticket choice, the sync ticket warning, and tests. Payment modes are unchanged: staging stays mock and production stays live WayForPay. The release goes to staging only, at the owner's request. Production has no Flash page.
