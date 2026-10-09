import Link from 'next/link';
import { Check, Lock, Play } from 'lucide-react';
import { LearningProgress } from '@/components/atoms/LearningProgress/LearningProgress';
import { canReadLesson } from '@/lib/learning/access';
import { lessonFraction } from '@/lib/learning/progress';
import { lessonHref, displayDate } from '@/lib/learning/selectors';
import type { CourseCurriculumProps } from './types';
export function CourseCurriculum({
  enrollment,
  lessonId,
  currentProgress,
  demo = false,
  onNavigate,
}: CourseCurriculumProps) {
  const lessons = enrollment.course.modules.flatMap((m) => m.lessons);
  const fraction = (id: string) =>
    lessonFraction(
      lessons.find((l) => l.id === id)!,
      id === lessonId
        ? currentProgress
        : enrollment.progress.find((p) => p.lesson_id === id)?.state || { blocks: {} },
    );
  const progress = lessons.length
    ? lessons.reduce((sum, l) => sum + fraction(l.id), 0) / lessons.length
    : 0;
  return (
    <div className="lesson-sidebar-inner">
      <LearningProgress value={progress} label="Прогрес курсу" />
      {enrollment.course.modules.map((module) => (
        <details className="curriculum-module" key={module.id} open>
          <summary>{module.title}</summary>
          <ol>
            {module.lessons.map((lesson) => {
              const available = canReadLesson(enrollment.grants, lesson);
              const complete = fraction(lesson.id) >= 0.999;
              return (
                <li key={lesson.id}>
                  <Link
                    className="curriculum-lesson"
                    href={available ? lessonHref(enrollment.course.id, lesson.id, demo) : '#'}
                    aria-current={lesson.id === lessonId ? 'page' : undefined}
                    aria-disabled={!available}
                    onClick={(event) => {
                      if (!available) event.preventDefault();
                      else onNavigate?.();
                    }}
                  >
                    <span
                      className={'curriculum-state' + (complete ? ' is-complete' : '')}
                      aria-label={
                        complete ? 'Завершено' : !available ? 'Заплановано' : 'Не завершено'
                      }
                    >
                      {complete ? (
                        <Check size={12} />
                      ) : !available ? (
                        <Lock size={10} />
                      ) : lesson.id === lessonId ? (
                        <Play size={10} />
                      ) : null}
                    </span>
                    <span>
                      {lesson.title}
                      {!available && lesson.releaseAt && (
                        <small>З {displayDate(lesson.releaseAt)}</small>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </details>
      ))}
    </div>
  );
}
