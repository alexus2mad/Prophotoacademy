import { lessonLabel } from '@/lib/learning/numbering';
import { LearningProgress } from '@/components/atoms/LearningProgress/LearningProgress';
import { CurriculumLesson } from '@/components/molecules/CurriculumLesson/CurriculumLesson';
import { canReadLesson } from '@/lib/learning/access';
import { lessonFraction } from '@/lib/learning/progress';
import { lessonHref } from '@/lib/learning/selectors';
import type { CourseCurriculumProps } from './types';
export function CourseCurriculum({
  enrollment,
  lessonId,
  currentProgress,
  currentChapterId,
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
        <section
          className="curriculum-module"
          key={module.id}
          data-current={module.lessons.some((lesson) => lesson.id === lessonId) || undefined}
        >
          <h2>{module.title}</h2>
          <ol>
            {module.lessons.map((lesson) => {
              const available = canReadLesson(enrollment.grants, lesson);
              const complete = fraction(lesson.id) >= 0.999;
              return (
                <li key={lesson.id}>
                  <CurriculumLesson
                    lesson={lesson}
                    label={lessonLabel(enrollment.course, lesson)}
                    href={lessonHref(enrollment.course.id, lesson.id, demo)}
                    available={available}
                    complete={complete}
                    current={lesson.id === lessonId}
                    currentChapterId={currentChapterId}
                    onNavigate={onNavigate}
                  />
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
