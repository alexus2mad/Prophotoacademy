# Food and product photography page — November 2026

`/food-product-photography` presents `program-food` ("Предметна та фуд-зйомка") with
the Creator course layout (`StudioCreatorTemplate`). The layout reads a
`StudioCourseEditorial` chosen by program id in `src/lib/studio-creator/selectors.ts`.
The food copy lives in `src/lib/studio-food/content.ts` and comes from the owner's
19 November 2026 course brief. Commerce stays in `offering-food-2026-12`.

- No lecturer section or video block until the owner supplies them.
- The course lasts 12 weeks. The brief skipped week 12; on 20 November 2026 the owner
  renumbered the diploma week from 13 to 12 everywhere.
- Tier-only lectures are marked "у Gold Pro та VIP Pro". The brief's "Для платинум"
  in week 4 is treated the same, because this course has no Platinum package.
- The brief's audience block was empty; the six audience cards summarize its
  curriculum for the existing course audiences.

## Photography

The `ui-image-curator` project agent (`.claude/agents/ui-image-curator.md`) chose
the hero from the owner's `food` folder. On 20 November 2026 the owner replaced the
student works with the
[Drive gallery](https://drive.google.com/drive/folders/14PZ6MmWtTLcye7IlGzuzz8-VP-bt9_09):
`Телефон` (31 photos) and `Камера` (14). Local copies are in `../food-gallery/phone`
and `../food-gallery/camera`. The phone order follows the owner's screenshots; the
camera order follows the Drive file names. The works filter shows «На телефон» first
and opens on it (`worksDevices` in the editorial). `scripts/food-course-images.json`
records each source file, crop focus and Ukrainian alt text.
`node scripts/prepare-food-course-images.mjs [sourceDirectory]` rebuilds the hashed
WebP files in `public/images/studio/food/` and the manifest
`src/lib/studio-food/images.json`. Content images keep the original file name in
`sourceFile` as provenance.

The hero source is only 1280 × 921 px. A higher-resolution original would make
wide desktop screens sharper. Its focus is `50% 80%` on desktop and `28% 50%` on
the tall mobile crop. On mobile, a third hero fact starts its own row.

## Packages

In the Creator layout the «Є оплата частинами» notice with the bank logos sits directly
under each package price, above the benefits. Other layouts keep it above the CTA.
