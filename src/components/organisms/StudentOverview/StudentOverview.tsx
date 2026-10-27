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
  const featured = courses.find((c) => c.status === 'active' && c.progress < 1) || courses[0];
  return (
    <>
      <div className="workspace-page-heading">
        <h1>{name ? `Раді бачити вас, ${name}` : 'Ваш простір для навчання'}</h1>
        <p>Продовжуйте з того місця, де зупинилися</p>
      </div>
      {featured ? (
        <div className={'student-dashboard-grid' + (nextSession ? ' has-session' : '')}>
          <LearningCourseCard course={featured} featured demo={demo} />
          {nextSession && (
            <aside className="next-session-card">
              <h2>Наступна зустріч</h2>
              <p className="session-title">{nextSession.title}</p>
              <p className="session-date">{displayDate(nextSession.starts_at)}</p>
              <p>
                {new Intl.DateTimeFormat('uk-UA', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Europe/Kyiv',
                }).format(new Date(nextSession.starts_at))}{' '}
                · Київ
              </p>
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
          <h2>Усі мої курси</h2>
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
