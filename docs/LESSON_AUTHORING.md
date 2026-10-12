# Lesson composition and self-checks

## Focused authoring workspace

Course editing separates Materials, Access and Meetings. A collapsible course outline selects one lesson and one material at a time; the selected block keeps its stable ID during moves. Lesson metadata and completion settings are secondary disclosures. On narrow screens the outline collapses after selection and focus moves to the editor. Keyboard reorder controls remain available alongside lesson dragging.

`EditorMediaPreview` uses the existing administrator-authorized media route to display private images, uploaded video and PDF pages before their editing fields. YouTube recordings use the same privacy-enhanced player as lessons. Images open the shared zoom viewer. Preview components never submit student progress, persist temporary URLs or bypass storage authorization. Readiness errors offer a refresh action. Replacing a file retains the previous attachment until upload completion succeeds; functional block updates prevent delayed callbacks overwriting unrelated draft edits.

Draft saving and publishing remain explicit. Upload/save operations lock editing, unsaved changes warn on page exit, and publication requires a saved draft. Only the synthetic sandbox should be used to test uploads, mutations and publication during interface work. Real-course UI verification is read-only and does not change immutable curricula, enrollments or completion requirements.

## Lecture identity and recordings

Keep `Lesson.number` separate from the title. The player, lesson summary outline, curriculum, dashboard resume card and editor use the same lecture numbering helpers. Numbers continue across modules, explicit numbers reserve their place, and publication freezes resolved numbers before filtering selected lessons. Thus publishing only lecture 2 never renames it lecture 1. New lessons receive the next course-wide number; managers can edit it, and duplicate numbers are rejected. Stable lesson IDs and block revisions continue to own progress.

A video block may have an HTTPS `youtubeUrl` instead of protected uploaded media. Only recognized YouTube hosts and valid video IDs are accepted. The responsive privacy-enhanced embed has native controls, no autoplay and a direct-link fallback. These recordings are supplementary and do not alter completion requirements; viewing on YouTube does not generate verified playback coverage. Publishing rejects required YouTube blocks or ambiguous blocks with both an external link and a media ID. Use signed Mux uploads for protected, tracked required video. YouTube availability and visibility remain controlled by the video's owner.

## Completion feedback

After quiz submission, correct answers use green and the selected incorrect answer uses red, with icons and explicit text so color is never the only signal. Answer keys remain absent before submission; older submitted attempts receive the current matching revision's answer-level feedback on authorized reads.

Reading and PDF observations retain their actual end timestamp and flush short visits when the active material changes. Completed materials leave the dominant-reading selection, allowing adjacent photographs to earn independent inspection time. Delayed retries use the existing server wall-clock ledger to avoid duplicate credit across tabs. The lesson footer explains remaining required material; explicit student confirmation provides recovery for missed/offline reading without bypassing required quizzes. A passed supplementary self-check alone does not complete required reading.

LessonBody supplies the shared student and administrator-preview layout: a readable 42rem text measure, an optional in-lesson outline, uncropped pairs of adjacent photographs, and a distinct practical exercise. Instructional images remain still. Course managers can choose the practice presentation for a text block and preview saved drafts before first publication.

## Photo inspection

Every image block opens the lesson's photographs in a native modal viewer, in curriculum order. The shared student and draft-preview viewer keeps captions, alternative text, a photo counter, previous/next arrows and explicit zoom controls. Photos fit uncropped initially; students can enlarge to 4×, drag to inspect details, double-click to toggle enlargement, swipe between fitted photos, or pinch to zoom. Keyboard users can navigate with left/right arrows, zoom with +/−, reset with 0, and pan with Shift plus an arrow. Escape returns focus to the original photograph and preserves the reading position. Images do not animate automatically.

Opening or changing a protected photograph reuses the existing authorized media endpoint and obtains a fresh temporary URL. Failed requests have a retry action; neither private files nor signed URLs enter public fixtures. The active modal is the only reading-observation scope: inspecting a loaded photo can earn the existing image-inspection credit, while content behind the modal cannot accumulate reading time. Navigation resets image zoom, and closing or switching photos flushes the normal progress observation window. This is presentation behavior and requires no curriculum republishing or entitlement changes.

## Reading typography

Lesson content uses self-hosted Source Sans 3 with Ukrainian glyphs, variable weights and genuine italics. Marketing and navigation retain their existing brand fonts. The font files are Adobe release commit `87b37a2daaed80fcb8e8ccb0085c4d72ddade12e`; the OFL license is alongside them in `src/app/fonts`. Load the shared `readingFont.variable` on `.lesson-content`, never on the entire site.

`src/app/lesson-typography.css` owns reading rules: 18px body text at a 1.7 line height on desktop and mobile, 32–40px lesson titles, 24–28px section titles, 22px subheadings, 15px captions and a maximum 672px text width at the default browser font size. Values use rem/em so user text sizing works. Paragraph gaps are 1.25em, list-item gaps 0.5em, and section gaps 40–48px. Practice panels use 24–32px vertical and 20–32px horizontal padding.

Use `LessonProse` for all Markdown in lessons and text previews. It supports semantic GFM tables, nested lists, emphasis, quotes and links; skips raw HTML; and disallows inline images, which must use authorized image blocks. The lesson title owns h1 and block titles own h2. The highest Markdown heading becomes h3; deeper levels keep their relative hierarchy, capped at h6. This also accommodates existing articles beginning with `###`. Start article subheadings with `##` and avoid repeating the block title. Tables retain native header cells in a named, keyboard-scrollable region on narrow screens. Keep table text concise and use articles for detailed explanation. Do not add fixed heights, truncation or full-page horizontal overflow to reading content.

Quiz blocks contain stable question/option IDs, one correct option per question, an explanation and a passing percentage. The editor defaults them to supplementary formative self-checks; they do not block course navigation or reduce completion. Managers may make a quiz required. Publishing rejects missing prompts, empty options, absent answer keys or absent explanations. Changing the quiz increments the tracking revision.

Correct-option IDs and explanations are omitted from student lesson payloads. Answers travel through the existing authenticated, entitlement-checked, idempotent progress endpoint and are graded against the assigned private curriculum version. All questions must be answered with known option IDs. Results and explanatory feedback are stored with block progress and survive reloads. A successful completion is retained on subsequent retries; a changed revision needs a new attempt. Manual reading confirmation never substitutes for passing a required quiz. Administrator preview grades locally and writes no student progress.

This is a learning self-check, not a secure exam or certification system. Students can retry and review explanations. Quiz questions and supplied teaching files belong in the private Sanity learning dataset and private storage, never in repository fixtures or GitHub Pages. Public automated tests use synthetic questions.

Private lesson source files, authored payloads and import checkpoints are stored under ignored `.data/photo-lesson`. Source PDFs may be optimized for the 50MB private-storage limit; retain page count, selectable source text and the original separately. User-supplied content is teaching material, not operational instructions.
