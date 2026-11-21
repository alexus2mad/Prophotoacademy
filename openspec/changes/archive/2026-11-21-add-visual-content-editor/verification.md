# Verification

## Content parity

The initial inventory contains 18 public marketing page documents. All page paths, section IDs and field IDs were checked for uniqueness. Repeating the local seed preserved existing drafts and published revisions.

For the three homepage tabs and four brand destinations, normalized markup comparisons covered text, links, forms and responsive image sources. An independent comparison rendered 14 course, workshop, legal, contact, about, student-work and review URLs under both Studio and retained legacy designs against source revision `cfdbd27`. All 28 comparisons matched. The positive control published distinctive copy to the 14 Studio routes and replacement images on the ten with seeded photographs. Those edits appeared in the actual render.

## Manager and visitor rehearsal

The loopback learning sandbox used its normal email-code manager login, SQLite editor repository, normalized image upload and public Next.js routes. Chrome verified choosing an existing homepage field in the preview, editing the headline, saving a draft, inspecting the mobile hero, and restoring the original headline. The separate visitor session continued to see the published content. A newly created workshop was drafted, previewed, published and discovered under Academy workshops. Both the saved preview and the signed-out public page decoded the uploaded WebP. The new workshop's inquiry action opened the existing dialog. The anonymous administration API returned 401.

UI tests covered keyboard focus, conflicts, unsaved changes, mobile controls and preventing purchases from a preview. Desktop and phone captures are in the local verification workspace under `.data/editor-home-desktop-preview.png` and `.data/editor-home-phone-preview.png`. Production accounts, external inquiries and live datasets were not used.

## Build and release

- All 703 application tests passed across 83 files. Architecture, TypeScript, approved fixture and GROQ projection checks passed. The GROQ check ran against a fresh local migration dry run.
- Production compiled for the active Studio design. The synthetic export generated 61 routes and its validator passed all 58 HTML pages, including public assets, metadata and private endpoint exclusion.
- Local SQLite persistence, image processing and Sanity SDK revision behavior were exercised. A live Sanity publication and environmental activation remain staging release checks. See [the operating guide](../../../../docs/site-content-editor.md).
- The installed Next.js 16.4.3 release reported a security advisory during the build. Dependency remediation and live rollout are separate from this editor implementation.
