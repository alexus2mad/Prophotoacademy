## Delivery
- [x] 1. Extend the page model, validate block/item/style boundaries and implement independent starting templates.
- [x] 2. Build a keyboard-accessible block picker, structure controls, item inspector and text appearance controls.
- [x] 3. Build an authenticated, searchable image library with upload, reuse and placement-specific selection.
- [x] 4. Render authored composition and typography in the working canvas and public pages, including responsive card grids and accessible carousels.
- [x] 5. Verify local workflows, compatibility, tests, architecture, types, build, review export and staging publication. Record release evidence.

## Verification evidence

- The local browser walkthrough created a workshop draft, added and reordered two cards and two slides, uploaded a photo once, reused it, and reopened the saved draft. Its public URL returned 404 before publication and 200 after. The mobile carousel advanced to the second slide. The 390px editor supported keyboard input without horizontal overflow.
- Native text appearance was published and reset on the homepage, About and AI Artwork in isolated local storage. A nested card field accepted direct keyboard editing in the canvas and opened the image library for its own photograph. A signed-out visitor could not retrieve private drafts or list library assets.
- TypeScript, Atomic Design checks, the changed-file format check and 732 tests passed. The synthetic export validated 58 pages including asset paths, privacy boundaries and noindex metadata.

## Staging release

On 23 November 2026, staging activated commit 07e0c1b. Anonymous HTTP checks matched all 18 pre-release pages for text, headings, image sources and descriptions, response status and indexing directives. The published marketing documents matched their original fingerprints.

A temporary workshop landing exercised the staging application’s authoring services and dedicated Sanity project. It returned 404 while private, retained the selected photograph and text appearance after saving and reopening, and returned 200 after publication. The published carousel served its selected image. The test removed its own two revision-checked documents, after which the URL returned 404 and the inventory contained the original 18 publications. Desktop and phone interactions were exercised in the local browser. Production remained on its previous release.
