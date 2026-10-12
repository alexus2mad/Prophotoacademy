import { lessonBlockFraction, lessonFraction } from '@/lib/learning/progress';
import type { LessonCompletionProps } from './types';

export function LessonCompletion({ lesson, progress, status }: LessonCompletionProps) {
  const fraction = lessonFraction(lesson, progress);
  const remaining = lesson.blocks.filter((b) => b.required && lessonBlockFraction(b, progress) < 1);
  return (
    <div className="lesson-completion">
      <strong>
        {fraction >= 1 ? 'Урок завершено' : `${Math.round(fraction * 100)}% уроку опрацьовано`}
      </strong>
      <span role="status">{status}</span>
      {remaining.length > 0 && (
        <details className="lesson-progress-details">
          <summary>Що залишилося опрацювати</summary>
          <p>
            Враховуються перегляд і час читання обов’язкових матеріалів. Додаткові матеріали не
            впливають на відсоток
          </p>
          <ul>
            {remaining.map((block) => (
              <li key={block.id}>
                <a href={'#material-' + block.id}>
                  {block.title || block.caption || block.alt || 'Навчальний матеріал'}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
