import Link from 'next/link';
import { LearningCourseCard } from '@/components/molecules/LearningCourseCard/LearningCourseCard';
import { displayDate, lessonHref } from '@/lib/learning/selectors';
import type { StudentOverviewProps } from './types';
export function StudentOverview({
  name,
  courses,
  nextSession,
  demo = false,
}: StudentOverviewProps) {
  const featured =
    courses.find((c) => c.status === 'active' && c.progress < 1) ||
    courses.find((c) => c.status === 'active') ||
    courses.find((c) => c.status === 'scheduled') ||
    courses[0];
  return (
    <>
      <header className="workspace-page-heading student-page-heading">
        <h1>Моє навчання</h1>
        {name && <p>Раді бачити вас, {name}</p>}
      </header>
      {featured ? (
        <div className="student-dashboard-grid">
          <LearningCourseCard course={featured} featured demo={demo} />
          {nextSession && (
            <aside className="next-session-card">
              <div className="next-session-copy">
                <p>Наступна зустріч</p>
                <h2>{nextSession.title}</h2>
                <time dateTime={nextSession.starts_at}>
                  {displayDate(nextSession.starts_at)} ·{' '}
                  {new Intl.DateTimeFormat('uk-UA', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Kyiv',
                  }).format(new Date(nextSession.starts_at))}{' '}
                  · Київ
                </time>
              </div>
              <Link
                className="button button-secondary"
                href={lessonHref(nextSession.course_id, nextSession.lesson_id, demo)}
              >
                Деталі зустрічі
              </Link>
            </aside>
          )}
        </div>
      ) : (
        <section className="workspace-empty">
          <h2>Ваш перший курс попереду</h2>
          <p>Курси, до яких ви отримаєте доступ, з’являться тут</p>
          <Link href="/courses" className="button">
            Обрати курс
          </Link>
        </section>
      )}
      {courses.length > 1 && (
        <section className="other-learning-courses">
          <h2>Інші курси</h2>
          <div>
            {courses
              .filter((c) => c.id !== featured?.id)
              .map((course) => (
                <LearningCourseCard key={course.id} course={course} demo={demo} />
              ))}
          </div>
        </section>
      )}
      <div className="learning-support">
        <p>Потрібна допомога з навчанням?</p>
        <Link href="/contacts">Зв’язатися з академією</Link>
      </div>
    </>
  );
}
