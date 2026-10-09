import Link from 'next/link';
import { LearningProgress } from '@/components/atoms/LearningProgress/LearningProgress';
import { assetHref, lessonHref, displayDate } from '@/lib/learning/selectors';
import type { LearningCourseCardProps } from './types';
export function LearningCourseCard({
  course,
  demo = false,
  featured = false,
}: LearningCourseCardProps) {
  return (
    <article className={'learning-course-card' + (featured ? ' is-featured' : '')}>
      <div className="learning-course-image">
        <img src={assetHref(course.cover)} alt="" />
      </div>
      <div className="learning-course-copy">
        <p className="learning-meta">{course.packageName}</p>
        <h2>{course.title}</h2>
        <LearningProgress
          value={course.progress}
          label={`${course.completed} із ${course.total} уроків завершено`}
        />
        {course.status === 'active' && course.nextLessonId ? (
          <>
            <p className="learning-next">
              Наступний урок <strong>{course.nextLessonTitle}</strong>
            </p>
            <Link className="button" href={lessonHref(course.courseId, course.nextLessonId, demo)}>
              {course.progress >= 1
                ? 'Переглянути матеріали'
                : course.progress > 0
                  ? 'Продовжити навчання'
                  : 'Почати навчання'}
            </Link>
          </>
        ) : (
          <p className="learning-status">
            {course.status === 'scheduled'
              ? 'Навчання почнеться за розкладом'
              : 'Термін доступу завершився'}
          </p>
        )}
        {course.expiresAt && (
          <p className="learning-meta">Доступ до {displayDate(course.expiresAt)}</p>
        )}
      </div>
    </article>
  );
}
