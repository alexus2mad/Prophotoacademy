# Food course and Content Creator URL move — 20 November 2026

Source `f8a8c1eb058ffc30fb8946f4852f9fc45e4ed9e7` moves the Content Creator course
to `/content-creator` and rebuilds `/food-product-photography` as the food and
product photography course. `/food-photography` permanently redirects (308) to
the new URL. See the [food course design notes](../FOOD_COURSE_DESIGN.md).

The food intake `offering-food-2026-12` opens BASE (7,900 UAH), GOLD PRO
(19,600 UAH) and VIP PRO (59,999 UAH) from 18 December 2026. Production sells
them through WayForPay; staging uses simulated checkout. These packages have no
curriculum mappings, so the Academy team grants lesson access after payment.
Read-only GET checks verified all six checkout forms (both courses), amounts,
dates and payment modes on each candidate and after activation. No order was
submitted.

Before release: architecture, TypeScript, formatting, content and social-card
checks, the production build and 673 of 674 tests passed. The sandbox row-count
test exceeds its 5-second timeout only under full-suite load and passes alone.
The pages were checked in the browser at desktop and 390px widths, locally and
on production.

Staging build `bse-USMP9TAYQ6PFV83wx` and production build `zenYWogNhEHxo4m6BRfCh`
were built on the isolated builder from the same source archive. Runtime, public
settings, nginx and the staging social gallery are unchanged. Both environments
retain `dfcd7dcad8cbfa196e66eef7a1b9af5039bd7d7c` as the single rollback;
`6feb5e125b968c0f681c5c2cf077b92ffd2f0248` was pruned. Release helpers and
receipts are in ignored `.data/food-course-release`.
