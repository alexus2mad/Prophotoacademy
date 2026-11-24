## Context

`workshop-offers.ts` defines editor workshop offers in code, with `packages: [Package]`, and the checkout route charges `offering.packages[0]`. The presentation (`WorkshopTicketPresentation`) carries one price and one checkout address, used by the cover action, the intro and offer blocks, the mobile action, the editor inspector and ticket choice. The AI Artwork intensive already models offline and online packages with prices at the top. Course packages already support `previousPrice`.

## Decisions

- **Offer model.** Workshop offers take `packages: [Package, ...Package[]]`. The Flash offer keeps `flash-without-fear-ticket` for the offline ticket (3 700, previous 4 200) and adds `flash-without-fear-online` (2 500, previous 3 000). Its format becomes `hybrid`. Descriptions and inclusions carry the date, time and location.
- **Checkout.** The route finds the package named in the request among the offer's packages. The order amount and `listAmount` stay the catalog price, so the previous price is never charged and promotional accounting is unchanged.
- **Presentation.** `WorkshopTicketPresentation` gains `options`, one per package with its label, description, inclusions, formatted price, optional previous price and checkout address. Its top-level price and address keep describing the first package, so single-ticket consumers work unchanged.
- **Components.** `WorkshopCheckoutAction` accepts a specific option, custom content and a label so it can render a price card as its purchase button. Previews keep it inert.
  - `WorkshopTicketPrices` (new molecule) renders the cover price cards: offline filled, online outlined, old price struck through, «грн» raised, following the owner's design.
  - `WorkshopOffer` renders one card per option when there are several. `WorkshopIntro` lists every price. The mobile action and the intro link to the cover prices.
  - The editor inspector and ticket choice list all prices, and the sync warning names both.
- **Content.** The page text is changed in the staging editor, through the main admin's Staging target, then saved and published on staging. Production content is not touched.

## Risks

Production runs the previous code until a later release. It has no Flash page, so nothing is sold there.
