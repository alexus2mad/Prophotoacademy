- [x] Specify the existing artwork design, reference examples and new-page authoring steps.
- [x] Compose the workshop artwork, inspect both crops and verify the generated JPEGs.
- [x] Verify the published workshop metadata and preserve unrelated cards and page publication boundaries.
- [x] Deliver and verify the staged cards and review gallery, then archive the specification.

## Verification

- Selected the workshop gallery’s side-lit portrait `w14.webp` from its published photographs. Reviewed the pair at native size and at compact preview sizes of 360px and 144px. Reframed the square separately to preserve the face and room for the title.
- The 1200 × 630 card is 60,605 bytes (SHA-256 prefix `4eea87272d47`), and the 630 × 630 card is 46,549 bytes (`fb4f3df8ed25`). The 33 existing pairs retain their previous manifest entries and checksums.
- All 818 tests, TypeScript, the 944-module architecture check, scoped formatting, social asset verification and the 58-page synthetic export passed. The unpublished production workshop returned 404.
- Staging release `6f57f41` served the current workshop title, description, canonical URL and both reviewed image URLs in the original HTML for Facebook, Telegram, WhatsApp and Viber crawler requests. Both anonymous JPEG downloads matched their manifest hashes; the previous staging release `715cfea` was retained for rollback.
- The independent staging review gallery passed 157 public checks for 34 pairs, including all 68 embedded downloads and its noindex policy. The new pair was visually checked at 390px and 1440px there.
