# Gallery popups - 13 November 2026

Source `af79ea8c1edeff942d0a4cfc106dfe9b28c5c098` removes visible captions
from public photo galleries and the lesson viewer. The popups retain photo
counts, navigation, zoom where available, and image alt text. Inline captions
remain in their original context.

Architecture, TypeScript and 32 focused tests passed. Chrome checks at 390px
and 1440px covered the homepage, AI Artwork, student work and a demo lesson
locally and on both live environments. Popup controls stayed fixed while
changing photos. Screenshots are in `.data/gallery-caption-qa/`.

Staging (`C71E-kzjS4g7bzuOxZBnL`) and production (`uRjRm2Hm1ILTa53bqTn9B`)
passed the deployment health checks. Both retain `683799c` for rollback.
Obsolete releases and inspected temporary build and transfer files were removed.
