'use client';
import { useZoomLesson } from './hooks';
import type { ZoomLessonProps } from './types';
export function ZoomLesson({ session, demo = false }: ZoomLessonProps) {
  const { zone, status } = useZoomLesson({ session });
  if (!session)
    return (
      <section className="lesson-block lesson-zoom">
        <h2>Зустріч із викладачем</h2>
        <p>Розклад цієї групи ще готується. Дата й посилання з’являться тут</p>
      </section>
    );
  const date = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: zone,
  }).format(new Date(session.starts_at));
  return (
    <section className="lesson-block lesson-zoom">
      <p className="live-status">
        {
          {
            upcoming: 'Заплановано',
            live: 'Зустріч триває',
            finished: 'Зустріч завершилася',
            rescheduled: 'Час змінено',
            canceled: 'Зустріч скасовано',
          }[status]
        }
      </p>
      <h2>{session.title}</h2>
      <time dateTime={session.starts_at}>{date}</time>
      <p>Ваш часовий пояс: {zone}</p>
      <div className="meeting-actions">
        {session.zoom_url && status !== 'canceled' && status !== 'finished' ? (
          <a href={session.zoom_url} target="_blank" rel="noopener noreferrer" className="button">
            Відкрити Zoom
          </a>
        ) : demo ? (
          <button type="button" disabled className="button">
            Zoom недоступний у демонстрації
          </button>
        ) : null}
        {!demo && status !== 'canceled' && (
          <a
            className="button button-secondary"
            href={`/api/learning/${session.course_id}/${session.lesson_id}/calendar?session=${session.id}`}
          >
            Додати в календар
          </a>
        )}
      </div>
      <p className="learning-meta">
        Участь підтвердить викладач після зустрічі. Якщо буде запис, його перегляд також зарахується
      </p>
    </section>
  );
}
