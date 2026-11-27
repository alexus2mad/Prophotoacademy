## Why

The Food course is now the Academy's main sale and starts on 17 December. The Commercial Content Creator course is withdrawn from sale and from the public site, but must be restorable later. Closed courses remain available in recordings, so their status should say so rather than "Набір закрито".

## What Changes

- Put the Food course first in the Studio course list and make it the configured primary course for the legacy catalog.
- Move the Food offering start to 2026-12-17 and update its catalog copy.
- Add an `archived` flag to programs. An archived program is left out of the public course lists, the legacy catalog, the sitemap, the review export and the page editor, and its page returns 404. Its content, offering and packages stay for students, admin and later recovery.
- Archive Content Creator, close its offering and temporarily redirect `/content-creator` to the homepage. The redirect is not permanent so the course can be restored by clearing the flag and the redirect.
- Every closed course shows «Доступно в записі» wherever «Набір закрито» was shown: catalog, course schedule, packages, checkout and the checkout API error. Closed non-course programs keep «Набір закрито».

## Capabilities

### Modified Capabilities

- `public-programs`: Food-first course order, archived programs and the recorded closure status.

## Impact

`content/academy.json`, Sanity program schema, course ordering and listing, sitemap, review export, editor seeds, closed-course copy, redirects, tests. Deployment to staging and production follows a separate request.
