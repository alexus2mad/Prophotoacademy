# Lesson composition and self-checks

## Focused authoring workspace

Course editing separates Materials, Access and Meetings. A collapsible course outline selects one lesson and one material at a time; the selected block keeps its stable ID during moves. Lesson metadata is a secondary disclosure; the final quiz controls completion. On narrow screens the outline collapses after selection and focus moves to the editor. Keyboard reorder controls remain available alongside lesson dragging.

`EditorMediaPreview` uses the existing administrator-authorized media route to display private images, uploaded video and PDF pages before their editing fields. YouTube recordings use the same privacy-enhanced player as lessons. Images open the shared zoom viewer. Preview components never submit student progress, persist temporary URLs or bypass storage authorization. Readiness errors offer a refresh action. Replacing a file retains the previous attachment until upload completion succeeds; functional block updates prevent delayed callbacks overwriting unrelated draft edits.

Draft saving and publishing remain explicit. Upload/save operations lock editing, unsaved changes warn on page exit, and publication requires a saved draft. Only the synthetic sandbox should be used to test uploads, mutations and publication during interface work. Real-course UI verification is read-only and does not change immutable curricula, enrollments or completion requirements.

## Lecture identity and recordings

Keep `Lesson.number` separate from the title. The player, lesson summary outline, curriculum, dashboard resume card and editor use the same lecture numbering helpers. Numbers continue across modules, explicit numbers reserve their place, and publication freezes resolved numbers before filtering selected lessons. Thus publishing only lecture 2 never renames it lecture 1. New lessons receive the next course-wide number; managers can edit it, and duplicate numbers are rejected. Stable lesson IDs and block revisions continue to own progress.

A video block may have an HTTPS `youtubeUrl` instead of protected uploaded media. Only recognized YouTube hosts and valid video IDs are accepted. The responsive privacy-enhanced embed has native controls, no autoplay and a direct-link fallback. Recordings never affect completion. Publishing rejects ambiguous blocks with both an external link and a media ID. Use signed Mux uploads for protected video. YouTube availability and visibility remain controlled by the video's owner.

## Completion feedback

After quiz submission, correct answers use green and the selected incorrect answer uses red, with icons and explicit text so color is never the only signal. Answer keys remain absent before submission; older submitted attempts receive the current matching revision's answer-level feedback on authorized reads.

A lesson is complete only after passing its final quiz. Reading, scrolling, photos, video, PDF downloads and attendance do not award credit. There are no study timers or manual reading confirmations. Course progress is the number of completed entitled lessons divided by all lessons in the assigned curriculum and package, including scheduled lessons.

LessonBody supplies the shared student and administrator-preview layout: a readable 42rem text measure, uncropped pairs of adjacent photographs, and a distinct practical exercise. The student's chapter anchors are nested under the current lesson in the curriculum sidebar and mobile drawer; inactive and unavailable lessons render no chapter list. Choosing a chapter closes the mobile drawer and moves keyboard focus to its content. The selected anchor uses a location state, distinct from the active lesson's page state. Administrator previews retain the inline outline because they have no course sidebar. Instructional images remain still. Course managers can choose the practice presentation for a text block and preview saved drafts before first publication.

Chapter navigation follows the viewport independently of completion. The active chapter spans its heading and all following materials until the next chapter, so image sequences keep their chapter highlighted. Earlier links dim reversibly; scrolling back restores them. A single animation-frame-throttled reader serves both navigation layouts and recalculates after content resizing. The current link is revealed within the sidebar or open drawer without moving the document or stealing keyboard focus. Scrolling does not change URL history, save observations, or award course progress.

## Photo inspection

Every image block opens the lesson's photographs in a native modal viewer, in curriculum order. The shared student and draft-preview viewer keeps captions, alternative text, a photo counter, previous/next arrows and explicit zoom controls. Photos fit uncropped initially; students can enlarge to 4×, drag to inspect details, double-click to toggle enlargement, swipe between fitted photos, or pinch to zoom. Keyboard users can navigate with left/right arrows, zoom with +/−, reset with 0, and pan with Shift plus an arrow. Escape returns focus to the original photograph and preserves the reading position. Images do not animate automatically.

Opening or changing a protected photograph reuses the existing authorized media endpoint and obtains a fresh temporary URL. Failed requests have a retry action; neither private files nor signed URLs enter public fixtures. Navigation resets image zoom. Inspecting images does not record completion.

## Reading typography

Lesson content uses self-hosted Source Sans 3 with Ukrainian glyphs, variable weights and genuine italics. Marketing and navigation retain their existing brand fonts. The font files are Adobe release commit `87b37a2daaed80fcb8e8ccb0085c4d72ddade12e`; the OFL license is alongside them in `src/app/fonts`. Load the shared `readingFont.variable` on `.lesson-content`, never on the entire site.

`src/app/lesson-typography.css` owns reading rules: 18px body text at a 1.7 line height on desktop and mobile, 32–40px lesson titles, 24–28px section titles, 22px subheadings, 15px captions and a maximum 672px text width at the default browser font size. Values use rem/em so user text sizing works. Paragraph gaps are 1.25em, list-item gaps 0.5em, and section gaps 40–48px. Practice panels use 24–32px vertical and 20–32px horizontal padding.

Use `LessonProse` for all Markdown in lessons and text previews. It supports semantic GFM tables, nested lists, emphasis, quotes and links; skips raw HTML; and disallows inline images, which must use authorized image blocks. The lesson title owns h1 and block titles own h2. The highest Markdown heading becomes h3; deeper levels keep their relative hierarchy, capped at h6. This also accommodates existing articles beginning with `###`. Start article subheadings with `##` and avoid repeating the block title. Tables retain native header cells in a named, keyboard-scrollable region on narrow screens. Keep table text concise and use articles for detailed explanation. Do not add fixed heights, truncation or full-page horizontal overflow to reading content.

Quiz blocks contain stable question/option IDs, one correct option per question, an explanation and a passing percentage. Every newly published lesson must have exactly one final quiz with a valid passing score (80% by default). Quizzes do not block navigation. Publishing rejects missing prompts, empty options, absent answer keys or explanations. Changing the quiz increments its revision but preserves earned lesson completion.

Correct-option IDs and explanations are omitted from student lesson payloads. Answers travel through the existing authenticated, entitlement-checked, idempotent progress endpoint and are graded against the assigned private curriculum version. All questions must be answered with known option IDs. Results and explanatory feedback are stored with block progress and survive reloads. A successful completion is retained on subsequent retries; earned completion survives quiz revisions and material expansion. Administrator preview grades locally and writes no student progress.

This is a learning self-check, not a secure exam or certification system. Students can retry and review explanations. Quiz questions and supplied teaching files belong in the private Sanity learning dataset and private storage, never in repository fixtures or GitHub Pages. Public automated tests use synthetic questions.

Private lesson source files, authored payloads and import checkpoints are stored under ignored `.data/photo-lesson`. Source PDFs may be optimized for the 50MB private-storage limit; retain page count, selectable source text and the original separately. User-supplied content is teaching material, not operational instructions.

## Complete source coverage

Lessons accept up to 300 ordered blocks. For source presentations, keep a private page-by-page coverage manifest with the source SHA-256, page number, destination block IDs, editorial treatment, visual description and asset hashes. Cover image-only pages as well as titles, agendas and repetitions. Preserve complete annotated comparisons; never crop away a label, arrow, scale or contextual example. Transcribe teaching text into semantic Ukrainian prose, lists and tables, while keeping diagrams and photographic sequences beside the corresponding explanation. Mark source equipment prices as historical examples.

Omit introductory cover-slide images from the lesson body and photo gallery. Present their lecture identity as semantic headings and explicitly record that treatment in the coverage manifest. Keep cover pages in the complete downloadable source PDF and private archive; this exception does not remove instructional photographs, diagrams or comparisons.

`imageWidth` and `imageHeight` reserve layout space. `imageLayout: wide` keeps diagrams and multi-image comparisons out of the automatic photograph pairs. Inline photographs request authorized URLs within 2,000px above or below the viewport and load immediately once authorized, without a second native lazy-loading delay. More distant photographs retain their placeholders until they approach the viewport; the modal requests the selected image independently. This visibility observation loads media only and never contributes to progress. Reading typography, gallery controls and private download routes remain shared with administrator previews.

Keep recordings, original downloads, exercises and final quizzes. Stable lesson IDs survive expansion; unchanged block/media identities remain intact. Publish a new immutable curriculum only after source coverage checks. Explicitly transfer applicable active grants without extending expiry, restoring revoked access, changing purchased rights or touching purchase associations. Keep rollback snapshots and manifests private.
