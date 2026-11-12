# Centered footer stack — 12 November 2026

Staging and production run application source
`72f961cde29e67790684e0a97b34b9616a6c06d4`.

At 768px and above, the footer's first column centers its heading, red inquiry
button and four social icons in a vertical stack, with 32px between the button
and icon row. The first desktop column has sufficient width for all four icons.
The existing two-column tablet layout remains in place.

The mobile social row stays below contact information. One shared JSX definition
renders the responsive placements; CSS hides the inactive placement, including
its links from keyboard focus and the accessibility tree. The 390px homepage and
Academy footer screenshots are pixel-identical to the preceding release.

Verification passed: architecture (727 modules), TypeScript, formatting, all 650
tests, both environment-specific Linux builds, and 58 validated synthetic review
pages. Browser checks covered four routes at 320, 390, 767, 768, 1024, 1101 and
1440px. They verified the shared centerline, 32px gap, one visible social row,
unbroken icon row, keyboard focus, hidden links, focused checkout/thanks footers
and no horizontal overflow. Evidence is in ignored `.data/footer-stack-qa/`.

| Environment | Build ID | Candidate checks | Live checks |
| --- | --- | ---: | ---: |
| Staging | `jEd1QvjX72vU5IvLRRoow` | 169 | 179 |
| Production | `rdrAfEEcFC1IxhZFS3M26` | 169 | 178 |

Runtime files were verified byte-identical before and after activation.
Production retains live WayForPay and existing notifications; staging retains
mock payments, noindex and its separate social-preview gallery. No orders,
messages or student records were created by verification.

The previous verified release is
`f0dd6c4b6b166386183f58e5901cae47e384ed8c` in each environment. Guarded cleanup
removed obsolete `8425340` releases, leaving exactly the active and previous
verified builds. Temporary isolated-builder files were removed. Operational
receipts, screenshots and build logs are under ignored
`.data/footer-stack-release/`.
