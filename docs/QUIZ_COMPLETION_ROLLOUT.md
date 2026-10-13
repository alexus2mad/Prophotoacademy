# Quiz-only completion rollout

Completion is a durable `state.quizCompletion` record on a lesson. Only a server-graded passing quiz creates it. Later failures, quiz revisions, additional materials and curriculum transfers preserve it. Course and booking statistics divide completed lessons by entitled lessons in the assigned release, including future releases of scheduled lessons. Attendance remains an independent roster.

The progress endpoint accepts `kind: quiz` with answers or `kind: resume` with a block and optional playback position. It also accepts legacy quiz submissions. Old timer, coverage and manual-reading events return the current state without awarding credit. Identity and entitlement are checked before and within the write transaction. Event IDs deduplicate submissions; each accepted quiz attempt has an immutable server-side result in `academy.quiz_attempts`. A delayed quiz submission is not discarded just because a newer bookmark arrived first.

Before activation:

1. Back up the database and private content manifests. Apply database migrations, including `202610130001_quiz_completion.sql`.
2. Run `tsx scripts/migrate-quiz-completion.ts` for a count-only preview. Run with `--apply` to save the transition. Run again and require `changed: 0`.
3. The migration regrades saved answers against the matching historical published quiz revision. A verified failed result with the old server-owned completion latch preserves the earlier pass, with unknown original attempt ID explicitly recorded. Reading, manual flags, attendance and unverifiable attempts never earn completion. Exact prior rows are retained in the private `academy.progress_policy_backup`; existing observations also remain in state for audit. Resume timestamps are preserved.
4. Activate the application. Check student and booking statistics, quiz failures/passes/retries, expired access and duplicate requests. Administrator previews must write no student progress.

Publication requires exactly one nonempty final quiz, a valid passing score, complete answer keys and explanations, and ready media. Navigation has no prerequisites. Quiz retries are unlimited. Answers remain hidden until a submission is graded.

Rollback requires restoring the previous app and the affected progress rows from the backup in a controlled maintenance window. Do not overwrite new quiz attempts or erase post-rollout passes: export and reconcile those before restoring rows. The migration is repeatable and reports counts without logging emails, answer keys or paid content.

Actual lesson payloads, slide coverage manifests, media mappings, backups and reconciliation reports remain private under ignored `.data` and on the restricted staging host. They must never enter Git or the static review export.
