import Link from 'next/link';
import { SessionRoster } from '@/components/organisms/SessionRoster/SessionRoster';
import { StudentLookup } from '@/components/organisms/StudentLookup/StudentLookup';
import type { AdminStudentsProps } from './types';

const sessionTime = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Kyiv',
});

export function AdminStudents({ overview, people, query, demo, demoRoster }: AdminStudentsProps) {
  const base = demo ? '/demo/admin/students' : '/admin/students';
  const upcoming = overview.sessions.filter(
    (s) => s.status !== 'canceled' && new Date(s.ends_at).getTime() > Date.now() - 86_400_000,
  );
  return (
    <>
      <div className="workspace-page-heading">
        <h1>Студенти</h1>
        <p>Облікові записи, доступ до курсів і виконання програми</p>
      </div>
      <div className="admin-grid">
        {[
          [overview.students, 'Облікових записів'],
          [overview.activeGrants, 'Активних доступів'],
          [overview.courses, 'Курсів'],
        ].map(([value, label]) => (
          <section className="admin-panel" key={label}>
            <strong className="metric-value">{value}</strong>
            <p>{label}</p>
          </section>
        ))}
      </div>
      {(overview.failedMedia > 0 || overview.pendingEmails > 0) && (
        <p className="admin-notice">
          Потребує уваги: матеріалів із помилкою — {overview.failedMedia}; листів очікують повторної
          доставки — {overview.pendingEmails}
        </p>
      )}
      {!!overview.courseStats?.length && (
        <section className="admin-section">
          <h2>Прогрес за курсами</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Курс</th>
                  <th>Студентів</th>
                  <th>Завершили</th>
                  <th>Середній прогрес</th>
                </tr>
              </thead>
              <tbody>
                {overview.courseStats.map((course) => (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{course.students}</td>
                    <td>{course.completed}</td>
                    <td>{Math.round(course.progress * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <section className="admin-section admin-panel">
        <h2>Зустрічі та відвідування</h2>
        {upcoming.length ? (
          <ul className="admin-list">
            {upcoming.map((session) => (
              <li key={session.id}>
                <div>
                  <strong>{session.title}</strong>
                  <p>{sessionTime.format(new Date(session.starts_at))} · Київ</p>
                </div>
                <SessionRoster
                  sessionId={session.id}
                  title={session.title}
                  demo={demo}
                  demoPeople={demoRoster}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-muted">Запланованих зустрічей поки немає</p>
        )}
      </section>
      <section className="admin-section">
        <h2>Облікові записи</h2>
        <form className="admin-search" action={base}>
          <label>
            Email або ім’я
            <input type="search" name="q" defaultValue={query} maxLength={100} />
          </label>
          <button className="button button-secondary" type="submit">
            Знайти
          </button>
        </form>
        <StudentLookup demo={demo} />
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Студент</th>
                <th>Курсів</th>
                <th>Роль</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person.id}>
                  <td>
                    <Link href={`${base}/${encodeURIComponent(person.email)}`}>
                      {person.name || person.email}
                    </Link>
                    <p className="admin-muted">{person.email}</p>
                  </td>
                  <td>{person.course_count}</td>
                  <td>{person.role === 'admin' ? 'Адміністратор' : 'Студент'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin-muted">
          {people.length
            ? 'Показано до 100 облікових записів. Для точнішого результату скористайтеся пошуком'
            : 'Нікого не знайдено'}
        </p>
      </section>
    </>
  );
}
