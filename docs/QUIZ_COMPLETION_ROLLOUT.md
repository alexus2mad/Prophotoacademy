# Quiz-only completion rollout

Completion is a durable `state.quizCompletion` record on a lesson. Only a server-graded passing quiz creates it. Later failures, quiz revisions, additional materials and curriculum transfers preserve it. Course and booking statistics divide completed lessons by entitled lessons in the assigned release, including future releases of scheduled lessons. Attendance remains an independent roster.

The progress endpoint accepts `kind: quiz` with answers or `kind: resume` with a block and optional playback position. It also accepts legacy quiz submissions. Old timer, coverage and manual-reading events return the current state without awarding credit. Identity and entitlement are checked before and within the write transaction. Event IDs deduplicate submissions; each accepted quiz attempt has an immutable server-side result in `academy.quiz_attempts`. A delayed quiz submission is not discarded just because a newer bookmark arrived first.

Before activation:

1. Back up the database and private content manifests. Apply database migrations, including `202610130001_quiz_completion.sql`, as the schema owner. The restricted application role cannot create tables. This migration grants that role only read/append access to the new evidence tables, with RLS; it does not grant update/delete access to quiz attempts or policy backups.
2. Run `tsx scripts/migrate-quiz-completion.ts` for a count-only preview. Run with `--apply` to save the transition. Run again and require `changed: 0`.
3. The migration regrades saved answers against the matching historical published quiz revision. A verified failed result with the old server-owned completion latch preserves the earlier pass, with unknown original attempt ID explicitly recorded. Reading, manual flags, attendance and unverifiable attempts never earn completion. Exact prior rows are retained in the private `academy.progress_policy_backup`; existing observations also remain in state for audit. Resume timestamps are preserved.
4. Activate the application. Check student and booking statistics, quiz failures/passes/retries, expired access and duplicate requests. Administrator previews must write no student progress.

Publication requires exactly one nonempty final quiz, a valid passing score, complete answer keys and explanations, and ready media. Navigation has no prerequisites. Quiz retries are unlimited. Answers remain hidden until a submission is graded.

Rollback requires restoring the previous app and the affected progress rows from the backup in a controlled maintenance window. Do not overwrite new quiz attempts or erase post-rollout passes: export and reconcile those before restoring rows. The migration is repeatable and reports counts without logging emails, answer keys or paid content.

Actual lesson payloads, slide coverage manifests, media mappings, backups and reconciliation reports remain private under ignored `.data` and on the restricted staging host. They must never enter Git or the static review export.

## Staging rollout, 13 October 2026

The complete curriculum was published as immutable version 5, followed by version 6 to remove the three introductory cover images at the owner's request. Lectures 2, 3 and 4 account for 104, 78 and 93 source pages respectively (275 total), now in 129, 93 and 111 blocks. Cover-page titles remain semantic text, with explicit mappings; complete source PDFs retain their covers. Each final quiz contains 16 questions with an 80% passing score. Existing recordings, original PDF downloads and instructional media identities remain unchanged. Native Ukrainian articles/tables accompany intact visual examples; product prices are labeled as source-era examples. The private manifest explicitly maps title, agenda, repeated and image-only pages.

The import added 241 protected images. Page dimensions reserve space before loading. Authorized URLs and image elements are created near the viewport; a gallery obtains the selected image on demand. Full comparison/diagram boundaries remain visible. There is no learning credit for loading or inspecting any of these assets.

The backfill examined three saved progress rows, verified one historical pass and left two incomplete. A repeat reported zero changes. The existing BASE rule and one active enrollment moved to version 5, then version 6, with identical lesson rights, purchase association, start, expiry and revocation fields. The cover-only revision was checked against the preceding immutable release: all remaining content and every saved progress row were identical. Earned completion survived the expanded quizzes. Student and management calculations both returned 1/3 (33%). The signed-in ps-booking overview and individual student card also displayed the matching 33%, with 1 of 3 lessons completed.

Validation: 147 tests across 27 files; architecture checks (424 modules), TypeScript, formatting, production build and 49-page synthetic review export. Database tests cover event deduplication, failed retries after a pass, unauthorized/revoked access, historical backfill, rollback copies and attendance isolation. Live checks confirmed anonymous media denial (401), private asset denial and no student-progress writes during failed/successful administrator-preview quizzes. Responsive checks covered 360, 390, 768, 1024 and 1440 CSS pixels, section anchors, scrollable semantic tables, the mobile curriculum, gallery arrows/zoom/Escape and the complete 93-page PDF in the browser viewer.

Evidence is stored privately in `.data/complete-lessons/`, including coverage, before/after reports and screenshots. The application build is `cd54203`; the schema permission correction is tracked in `36aab0c` and was applied using the schema owner. The public review contains synthetic lessons only.

Browser text-zoom shortcuts did not change the in-app browser scale, so enlarged-text visual testing remains a manual check; responsive reflow and keyboard controls were verified independently. The 49-page synthetic GitHub review was published to `gh-pages` at `48a7b90`; private curriculum changes require no public review assets.
