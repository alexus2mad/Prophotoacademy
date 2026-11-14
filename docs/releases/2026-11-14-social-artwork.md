# Social preview artwork — 14 November 2026

Release `a773714f823f59d1dd3806bbde947b4cd08e05b6` uses the same full-bleed photograph and typographic hierarchy in each wide and square preview. It removes the repeated Academy name and URL from the image, and shades the photograph behind the text according to its contrast. The 33 pairs use versioned URLs; previously issued URLs remain available.

Reviewed all 66 images visually. The final pass corrected portrait crops on Academy and course cards, selected a more suitable founder photograph for About and a wider photograph for Student Work, and refined the AI Artwork square crop. The largest final JPEG is 147,533 bytes. The [public review gallery](https://staging.prophotoacademy.com.ua/social-previews/) contains the exact approved JPEGs and is excluded from indexing.

The social image checker, architecture checks, TypeScript, 47 focused tests, and the validated 58-page review export passed. Both live environments passed health and content smoke checks. Requests with Facebook, Telegram, WhatsApp, and Viber user agents returned the expected metadata on eight sampled routes per environment, and all 66 served JPEGs matched the manifest checksums. This verifies what the sites serve; third-party caches were not purged.

Staging build `hCAhJAp1QcYQNlNuJmVqx` and production build `d2ozEvbbACzY_dtcBy4Zi` each retain `af79ea8c1edeff942d0a4cfc106dfe9b28c5c098` for rollback. Obsolete app releases, release transfers and isolated build files were removed. The prior review gallery is backed up separately in the staging social preview release journal.
