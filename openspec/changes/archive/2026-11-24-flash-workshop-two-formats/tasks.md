## 1. Offer and checkout

- [x] 1.1 Allow several workshop packages, define the Flash offline and online tickets with previous prices, and charge the requested package; test both orders, the unknown package and the unchanged single-ticket path.

## 2. Presentation

- [x] 2.1 Add ticket options to the presentation, the cover price cards, multi-card offer and intro prices, the mobile link, and the editor and sync summaries; test markup for both cards, struck prices, inert previews and single-ticket pages.
- [x] 2.2 Run architecture, typecheck, formatting, OpenSpec checks, the full test suite and the Pages export.

## 2a. Announcement block

- [x] 2a.1 Add the «Анонс із цінами» intensive block, its fields and rendering in the AI Artwork announcement layout with the owner's price-card design; lead the cover to it; test fields, markup, inert previews and the cover link.
- [x] 2a.2 Check the block at desktop and 390 px against the owner's design.

## 3. Staging

- [x] 3.1 Release the revision to staging only and verify health, the two prices and each ticket's checkout action. No staging order was submitted without the owner's approval; route tests charge each package at its catalog price.
- [x] 3.2 In the staging editor, add the date and location, replace «до 6–7 учасників» with «кількість місць обмежена», update the format list's price line, save and publish on staging; verify desktop and phone.
- [x] 3.3 In the staging editor, insert «Анонс із цінами» after the cover, fill it and publish on staging; verify desktop and phone.

## Verification

- Staging runs `7930356` (rollback `a862e24`). Production is unchanged on `0ebadc7` and has no Flash page.
- At 1440 px the Flash announcement matches AI Artwork: 129.6 px padding, eyebrow at 130, title at 155, pill at 311, prices at 367, two 363 px cards with a 12 px gap and 86.4 px prices. The cards are 154 px tall instead of 145 because of the larger discount label. At 390 px the page is 375 px wide with no overflow, and the cards measure 167 × 97 against AI Artwork's 167 × 94.
- The full suite (855 tests), architecture, typecheck, OpenSpec checks and Pages export passed for the formats release. Editor and workshop tests passed for each follow-up.
