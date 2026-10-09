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
        <div className="student-dashboard-grid">
          <LearningCourseCard course={featured} featured demo={demo} />
          <aside className="next-session-card">
            <h2>{nextSession ? 'Наступна зустріч' : 'Навчайтеся у своєму темпі'}</h2>
            {nextSession ? (
              <>
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
              </>
            ) : (
              <p>
                Усі доступні уроки та матеріали вже у вашому кабінеті. Обирайте зручний час і
                повертайтеся до важливого.
              </p>
            )}
          </aside>
        </div>
      ) : (
        <section className="workspace-empty">
          <h2>Ваш перший курс попереду</h2>
          <p>Після підтвердження оплати курс з’явиться тут автоматично</p>
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
