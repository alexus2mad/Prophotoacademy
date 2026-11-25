## MODIFIED Requirements

### Requirement: Author practical workshops in the visual editor

An administrator SHALL be able to create a workshop with a photographic cover, an editorial introduction, a curriculum accordion, a photo gallery, format highlights and an offer section. The editor SHALL support page-specific copy, original library images and a governed ticket offer that purchases the selected workshop. When the offer has several tickets, the page SHALL present each ticket's price, any previous price and its own purchase action.

#### Scenario: Author and publish in the editor

- **WHEN** the administrator creates a practical workshop, fills its sections and publishes
- **THEN** desktop and mobile visitors see the authored copy, ordered photographs and interactions, and the administrator can reopen and edit the saved document.

#### Scenario: Draft and ticket boundaries

- **WHEN** the administrator changes an unpublished draft or chooses a ticket
- **THEN** public content changes only at publication, and an author cannot override the charged price or payment verification through a display field.

#### Scenario: Present several ticket formats

- **WHEN** a published workshop's offer has offline and online tickets with previous prices
- **THEN** the cover or its announcement shows both prices with the previous ones struck through, the offline price filled and the online outlined, each starting its own checkout. The introduction lists both prices when there is no ticket announcement, the offer section shows one purchase card per ticket, and the editor preview keeps the purchase controls inert.

#### Scenario: Announce the prices after the cover

- **WHEN** an administrator adds «Анонс із цінами» to a workshop with a bound ticket offer
- **THEN** the page shows a centred announcement with the authored eyebrow, title, subtitle, date pill and closing line, and the ticket prices in large cards with previous prices struck through; the cover's action leads to these cards, prices stay governed by the offer, and the editor preview keeps the cards inert. The introduction retains its editorial copy, authored facts and action while omitting the repeated automatic price summary.
