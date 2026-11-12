# Footer social links — 12 November 2026

Application source: `f0dd6c4b6b166386183f58e5901cae47e384ed8c`.

The Studio footer now displays Instagram, Telegram, YouTube and Facebook on
desktop as well as mobile. The former desktop rule hid the social row, and
Facebook was absent. The four original SVGs and destinations were verified
against the published Webflow footer and copied locally. Their provenance is in
[the asset record](../../public/brand/social/README.md).

The row uses named navigation, individually labeled external links, 56px targets,
visible keyboard focus and uncropped icons. Checkout and thank-you pages retain
their focused footer. The retained legacy design is unchanged.

Verification passed: architecture (727 modules), TypeScript, formatting,
11 focused tests and all 650 suite tests. The restricted full-suite run blocked
one sandbox loopback connection; all four tests in that file passed on rerun
with loopback permission. Browser checks covered home, Academy, checkout and
thanks at 320, 390, 768 and 1440px, with keyboard focus, icon loading and no
horizontal overflow. Screenshots are under ignored `.data/footer-social-qa/`.
The synthetic export validates all 58 review pages and the four prefixed local
icon URLs. Both environment-specific Linux production builds also passed.

Staging and production use the same source revision, built with their own public
configuration. Build IDs are `6U_plJg7l7J3rl7UJUaoV` (staging) and
`5Afut6ug3d8xqx6vxmNTs` (production). Each candidate passed 91 focused checks;
the deployed staging and production pages passed 98 and 97 checks respectively.
Runtime files were verified byte-identical before and after activation.
Production retains live WayForPay and existing notifications; staging retains
mock payments, noindex and its separately served social-preview gallery.
No CMS content, authentication, customer records or payment rules changed.

The previous verified application revision is
`8425340e60f0a28ba1d6cc213a8a7df73286d636` in both environments. Guarded cleanup
removed the obsolete `66f5dac` build from each environment, retaining exactly
the active and previous verified releases. The isolated builder's temporary
files were removed after verification. Private release
receipts, screenshots and build/verification logs are retained under ignored
`.data/footer-social-release/`.
