# Course package pricing

The 27 October 2026 pricing revision keeps BASE prices and existing package identities. GOLD is the featured tier. Prices below are in UAH.

| Course | BASE | GOLD | PLATINUM |
| --- | ---: | ---: | ---: |
| Commercial Content | 9,600 | 29,900 | 79,900 |
| Visual Content | 7,500 | 25,500 | 63,900 |
| Instagram | 4,200 | 11,900 | 29,900 |

Commercial prices are the owner's explicit amounts. Visual GOLD takes the former PLATINUM price; the new PLATINUM is approximately 2.5 times GOLD, rounded to a retail price ending in 900. Instagram's existing expert package becomes GOLD; its new PLATINUM is inquiry-only until its benefits and access are defined. These are authored amounts, not a runtime pricing formula.

## Identity and commercial boundaries

- Keep `visual-*` and `commercial-*` IDs. The Instagram GOLD package retains `instagram-expert`, its existing benefits and lifetime-access promise. Its previous-price promotion is removed.
- `instagram-platinum` is new, priced at 29,900, with `inquiryOnly: true`, waitlist availability and no invented inclusions. Its inquiry opens with the selected program and package. Do not promise immediate learning access.
- Existing availability is unchanged: all three GOLD packages remain sold out. A featured label never opens sales. Reopening a package requires a separate, explicit content decision.
- `inquiryOnly` is enforced by both paid/mock checkout eligibility and disabled-payment test enrollment. Changing availability or passing stale enrollment props must not bypass it.
- No order, payment, purchase snapshot, grant or curriculum mapping is rewritten. Existing customers retain their original purchase records and rights. New paid orders resolve the current authored price on the server.

## Content ownership

`content/academy.json` is the source while `CONTENT_MODE=fixture`. The same resolved content supplies catalog summaries, package cards, comparisons and checkout. Sanity packages support optional `featured` and `inquiryOnly` fields; at most one package per offering may be featured.

`pnpm content:migrate` refreshes the checked-in migration preview without changing remote content. Its `--write` mode uses `createIfNotExists`, so it does not update existing Sanity documents. Before using `CONTENT_MODE=sanity`, review and patch the corresponding existing offering documents explicitly; do not assume a generated preview has published prices. This revision performs no remote CMS mutation.

This dry-run snapshot refresh also catches up previously authored gallery content and availability corrections: 137 documents and 57 images, up from the stale snapshot's 63 documents and 19 images. It is a complete fixture preview, not a narrowly scoped CMS price patch.

## Presentation and verification

GOLD uses the elevated neutral surface, a stronger border and the label “Найпопулярніший”. Available featured actions use the shared white pill; other tiers use bordered pills. Sold-out status remains noninteractive. Mobile comparison initially selects BASE and GOLD and places the popularity label above the table, where it fits without breaking Ukrainian words.

`tests/pricing.test.ts` covers authored prices, stable IDs, server-side checkout resolution, sold-out states, inquiry-only restrictions in all payment modes and shared card/comparison presentation. The existing WayForPay integration test checks the revised Visual PLATINUM amount through checkout and callback.

Before release, run content validation, architecture, formatting, TypeScript, the full test suite, production build and synthetic Pages validation. Check the three program pages at 360, 390, 768, 1024 and 1440px, plus mobile comparison and the Instagram inquiry. Local review does not deploy prices to staging or production.
