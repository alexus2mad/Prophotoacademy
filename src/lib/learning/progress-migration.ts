import { gradeQuiz } from './quiz';
import type { CourseRelease, LessonProgress, ProgressRow, QuizCompletion } from './types';
import type { SqlConnection } from '../database/types';

export function historicalQuizCompletion(
  row: ProgressRow,
  releases: CourseRelease[],
): QuizCompletion | undefined {
  if (row.state.quizCompletion) return row.state.quizCompletion;
  for (const release of releases.filter((r) => r.course_id === row.course_id)) {
    const lesson = release.manifest.modules
      .flatMap((m) => m.lessons)
      .find((l) => l.id === row.lesson_id);
    for (const block of lesson?.blocks || []) {
      const saved = row.state.blocks?.[block.id];
      if (block.kind !== 'quiz' || !block.quiz || !saved?.quiz || saved.revision !== block.revision)
        continue;
      try {
        const verified = gradeQuiz(block.quiz, saved.quiz.answers, saved.quiz.attemptId);
        const resultMatches =
          verified.passed === saved.quiz.passed &&
          verified.correct === saved.quiz.correct &&
          verified.total === saved.quiz.total;
        if (!resultMatches || (!verified.passed && !saved.completed)) continue;
        // The old server latched completed only after grading a successful quiz.
        // A failed latest attempt may therefore carry evidence of an earlier pass.
        return {
          quizId: block.id,
          revision: block.revision,
          attemptId: verified.passed ? saved.quiz.attemptId : null,
          completedAt: row.updated_at,
          source: verified.passed ? 'legacy-passing-result' : 'legacy-pass-latch',
        };
      } catch {
        /* Unverifiable results never earn completion. */
      }
    }
  }
}

export async function migrateQuizCompletion(db: SqlConnection, apply = false) {
  await db.query('SELECT pg_advisory_xact_lock(710130)');
  const releases = (await db.query<CourseRelease>('SELECT * FROM academy.releases')).rows;
  const rows = (await db.query<ProgressRow>('SELECT * FROM academy.lesson_progress FOR UPDATE'))
    .rows;
  const report = { examined: rows.length, passed: 0, priorPass: 0, incomplete: 0, changed: 0 };
  for (const row of rows) {
    const completion = historicalQuizCompletion(row, releases);
    if (completion) {
      report.passed++;
      if (completion.source === 'legacy-pass-latch') report.priorPass++;
    } else report.incomplete++;
    if (row.state.quizCompletion || (!row.completed_at && !row.completion_source && !completion))
      continue;
    report.changed++;
    if (!apply) continue;
    const state: LessonProgress = { ...row.state, quizCompletion: completion };
    await db.query(
      'INSERT INTO academy.progress_policy_backup(user_id,course_id,lesson_id,previous_row) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',
      [row.user_id, row.course_id, row.lesson_id, JSON.stringify(row)],
    );
    await db.query(
      'UPDATE academy.lesson_progress SET state=$4, completed_at=$5, completion_source=$6 WHERE user_id=$1 AND course_id=$2 AND lesson_id=$3',
      [
        row.user_id,
        row.course_id,
        row.lesson_id,
        JSON.stringify(state),
        completion?.completedAt || null,
        completion ? 'automatic' : null,
      ],
    );
  }
  return report;
}
