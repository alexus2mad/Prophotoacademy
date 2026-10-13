import { lessonFraction } from '@/lib/learning/progress';
import type { LessonCompletionProps } from './types';

export function LessonCompletion({ lesson, progress, status }: LessonCompletionProps) {
  const complete = lessonFraction(lesson, progress) === 1;
  const quiz = lesson.blocks.find((block) => block.kind === 'quiz');
  return (
    <div className="lesson-completion">
      <strong>{complete ? 'Урок завершено' : 'Урок ще не завершено'}</strong>
      <span role="status">{status}</span>
      {!complete && quiz && (
        <p>
          Для завершення пройдіть <a href={'#material-' + quiz.id}>підсумковий тест</a> — від{' '}
          {quiz.quiz?.passingScore || 80}% правильних відповідей. Кількість спроб необмежена
        </p>
      )}
    </div>
  );
}
