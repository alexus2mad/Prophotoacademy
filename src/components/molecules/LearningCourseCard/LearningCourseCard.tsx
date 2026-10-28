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
      <header className="learning-course-heading">
        <div>
          <p className="learning-meta">{course.packageName}</p>
          <h2>{course.title}</h2>
        </div>
        <div className="learning-course-image">
          <img src={assetHref(course.cover)} alt="" loading={featured ? 'eager' : 'lazy'} />
        </div>
      </header>
      <div className="learning-course-copy">
        <LearningProgress
          value={course.progress}
          label={`${course.completed} із ${course.total} уроків завершено`}
        />
        {course.status === 'active' && course.nextLessonId ? (
          <div className="learning-course-action">
            {featured && course.progress < 1 && (
              <p className="learning-next">
                Наступний урок <strong>{course.nextLessonTitle}</strong>
              </p>
            )}
            <Link
              className={'button' + (featured ? '' : ' button-secondary')}
              href={lessonHref(course.courseId, course.nextLessonId, demo)}
            >
              {!featured
                ? 'Відкрити курс'
                : course.progress >= 1
                  ? 'Переглянути матеріали'
                  : course.progress > 0
                    ? 'Продовжити навчання'
                    : 'Почати навчання'}
            </Link>
          </div>
        ) : (
          <p className="learning-status">
            {course.status === 'scheduled'
              ? 'Навчання почнеться за розкладом'
              : 'Термін доступу завершився'}
          </p>
        )}
        {course.status !== 'expired' && (
          <p className="learning-access-note">
            {course.expiresAt
              ? `Доступ до ${displayDate(course.expiresAt)}`
              : 'Безстроковий доступ'}
          </p>
        )}
      </div>
    </article>
  );
}
