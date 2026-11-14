# Content Creator course — 15 November 2026

Source `5404632ed2614318b7879e1f4595970492fcaac9` activates the updated Figma
frame at `/food-product-photography`. Enrollment is open for BASE (9,600 UAH),
GOLD (29,900 UAH) and PLATINUM (79,900 UAH). The page shows the Figma start date
of 27 November 2026. See the [design notes](../CONTENT_CREATOR_DESIGN.md) and
[source differences](../FIGMA_ARTIFACT_DIFFERENCES.md).

The three production forms use WayForPay and the staging forms use simulated
checkout. Read-only checks verified their package IDs, amounts, dates and modes
before and after activation. The Academy team provisions lesson access because
the commercial packages have no published curriculum mappings.

Architecture, TypeScript, content checks, focused tests and the 58-page synthetic
export passed. The deployed course was checked at 360, 390, 768, 1024 and 1440px
in each environment. The staging checks also covered gallery gestures and 200%
text for prices and curriculum. Screenshots are under `.data/content-creator-design`.

Staging build `G0XNRraaC-Lp0Xmz3_2I3` and production build `83PvEKYF_OtyMoluazxNU`
passed health and content checks. Both retain `b307caca4d219537c2b3408af1ecf9d9360a8f8a`
as the single rollback. The staging social gallery is still available.
