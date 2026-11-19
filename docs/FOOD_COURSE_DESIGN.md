# Food and product photography page — November 2026

`/food-product-photography` presents `program-food` ("Предметна та фуд-зйомка") with
the Creator course layout (`StudioCreatorTemplate`). The layout reads a
`StudioCourseEditorial` chosen by program id in `src/lib/studio-creator/selectors.ts`.
The food copy lives in `src/lib/studio-food/content.ts` and comes from the owner's
19 November 2026 course brief. Commerce stays in `offering-food-2026-12`.

- No lecturer section or video block until the owner supplies them.
- The brief numbers the weeks 1–11 and 13; the curriculum keeps that numbering.
- Tier-only lectures are marked "у Gold Pro та VIP Pro". The brief's "Для платинум"
  in week 4 is treated the same, because this course has no Platinum package.
- The brief's audience block was empty; the six audience cards summarize its
  curriculum for the existing course audiences.

## Photography

The `ui-image-curator` project agent (`.claude/agents/ui-image-curator.md`) chose
the photographs from the owner's `food` folder. `scripts/food-course-images.json`
records each source file, crop focus and Ukrainian alt text.
`node scripts/prepare-food-course-images.mjs [sourceDirectory]` rebuilds the hashed
WebP files in `public/images/studio/food/` and the manifest
`src/lib/studio-food/images.json`. Content images keep the original file name in
`sourceFile` as provenance.

The hero source is only 1280 × 921 px. A higher-resolution original would make
wide desktop screens sharper. Its focus is `50% 80%` on desktop and `28% 50%` on
the tall mobile crop. On mobile, a third hero fact starts its own row.
