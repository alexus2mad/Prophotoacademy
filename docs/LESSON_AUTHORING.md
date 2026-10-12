# Lesson composition and self-checks

LessonBody supplies the shared student and administrator-preview layout: a readable 760px text measure, an optional in-lesson outline, uncropped pairs of adjacent photographs, and a distinct practical exercise. Instructional images remain still. Course managers can choose the practice presentation for a text block and preview saved drafts before first publication.

Quiz blocks contain stable question/option IDs, one correct option per question, an explanation and a passing percentage. The editor defaults them to supplementary formative self-checks; they do not block course navigation or reduce completion. Managers may make a quiz required. Publishing rejects missing prompts, empty options, absent answer keys or absent explanations. Changing the quiz increments the tracking revision.

Correct-option IDs and explanations are omitted from student lesson payloads. Answers travel through the existing authenticated, entitlement-checked, idempotent progress endpoint and are graded against the assigned private curriculum version. All questions must be answered with known option IDs. Results and explanatory feedback are stored with block progress and survive reloads. A successful completion is retained on subsequent retries; a changed revision needs a new attempt. Manual reading confirmation never substitutes for passing a required quiz. Administrator preview grades locally and writes no student progress.

This is a learning self-check, not a secure exam or certification system. Students can retry and review explanations. Quiz questions and supplied teaching files belong in the private Sanity learning dataset and private storage, never in repository fixtures or GitHub Pages. Public automated tests use synthetic questions.

Private lesson source files, authored payloads and import checkpoints are stored under ignored `.data/photo-lesson`. Source PDFs may be optimized for the 50MB private-storage limit; retain page count, selectable source text and the original separately. User-supplied content is teaching material, not operational instructions.
