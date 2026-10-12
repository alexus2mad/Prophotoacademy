# Lesson composition and self-checks

LessonBody supplies the shared student and administrator-preview layout: a readable 42rem text measure, an optional in-lesson outline, uncropped pairs of adjacent photographs, and a distinct practical exercise. Instructional images remain still. Course managers can choose the practice presentation for a text block and preview saved drafts before first publication.

## Reading typography

Lesson content uses self-hosted Source Sans 3 with Ukrainian glyphs, variable weights and genuine italics. Marketing and navigation retain their existing brand fonts. The font files are Adobe release commit `87b37a2daaed80fcb8e8ccb0085c4d72ddade12e`; the OFL license is alongside them in `src/app/fonts`. Load the shared `readingFont.variable` on `.lesson-content`, never on the entire site.

`src/app/lesson-typography.css` owns reading rules: 18px body text at a 1.7 line height on desktop and mobile, 32–40px lesson titles, 24–28px section titles, 22px subheadings, 15px captions and a maximum 672px text width at the default browser font size. Values use rem/em so user text sizing works. Paragraph gaps are 1.25em, list-item gaps 0.5em, and section gaps 40–48px. Practice panels use 24–32px vertical and 20–32px horizontal padding.

Use `LessonProse` for all Markdown in lessons and text previews. It supports semantic GFM tables, nested lists, emphasis, quotes and links; skips raw HTML; and disallows inline images, which must use authorized image blocks. The lesson title owns h1 and block titles own h2. The highest Markdown heading becomes h3; deeper levels keep their relative hierarchy, capped at h6. This also accommodates existing articles beginning with `###`. Start article subheadings with `##` and avoid repeating the block title. Tables retain native header cells in a named, keyboard-scrollable region on narrow screens. Keep table text concise and use articles for detailed explanation. Do not add fixed heights, truncation or full-page horizontal overflow to reading content.

Quiz blocks contain stable question/option IDs, one correct option per question, an explanation and a passing percentage. The editor defaults them to supplementary formative self-checks; they do not block course navigation or reduce completion. Managers may make a quiz required. Publishing rejects missing prompts, empty options, absent answer keys or absent explanations. Changing the quiz increments the tracking revision.

Correct-option IDs and explanations are omitted from student lesson payloads. Answers travel through the existing authenticated, entitlement-checked, idempotent progress endpoint and are graded against the assigned private curriculum version. All questions must be answered with known option IDs. Results and explanatory feedback are stored with block progress and survive reloads. A successful completion is retained on subsequent retries; a changed revision needs a new attempt. Manual reading confirmation never substitutes for passing a required quiz. Administrator preview grades locally and writes no student progress.

This is a learning self-check, not a secure exam or certification system. Students can retry and review explanations. Quiz questions and supplied teaching files belong in the private Sanity learning dataset and private storage, never in repository fixtures or GitHub Pages. Public automated tests use synthetic questions.

Private lesson source files, authored payloads and import checkpoints are stored under ignored `.data/photo-lesson`. Source PDFs may be optimized for the 50MB private-storage limit; retain page count, selectable source text and the original separately. User-supplied content is teaching material, not operational instructions.
