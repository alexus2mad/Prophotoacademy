'use client';
import { displayDate } from '@/lib/learning/selectors';
import { useCourseSessions } from './hooks';
import { managementUrl } from '@/lib/commerce/cashbox';
import type { CourseSessionsProps } from './types';
import type { LiveSession } from '@/lib/learning/types';
export function CourseSessions(props: CourseSessionsProps) {
  const h = useCourseSessions(props),
    lessons =
      props.data.releases[0]?.manifest.modules
        .flatMap((m) => m.lessons)
        .filter((l) => l.blocks.some((b) => b.kind === 'zoom')) || [];
  return (
    <section className="admin-section admin-panel">
      <h2>Зустрічі Zoom</h2>
      {props.data.sessions.length > 0 && (
        <ul className="admin-list">
          {props.data.sessions.map((s) => (
            <li key={s.id}>
              <div>
                <strong>{s.title}</strong>
                <p>
                  {displayDate(s.starts_at)} ·{' '}
                  {s.status === 'canceled'
                    ? 'Скасовано'
                    : s.status === 'rescheduled'
                      ? 'Час змінено'
                      : 'Заплановано'}
                </p>
              </div>
              <button type="button" className="button button-secondary" onClick={() => h.edit(s)}>
                Відкрити
              </button>
            </li>
          ))}
        </ul>
      )}
      {!lessons.length ? (
        <p>Додайте Zoom-блок до уроку та опублікуйте програму, щоб створити розклад</p>
      ) : (
        <form className="admin-form admin-section" onSubmit={h.save}>
          <h3>{h.id ? 'Налаштування зустрічі' : 'Нова зустріч'}</h3>
          <label>
            Урок
            <select
              value={h.lessonId}
              onChange={(e) => h.setLessonId(e.target.value)}
              required
              disabled={!!h.id}
            >
              <option value="">Оберіть урок</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Набір
            <select
              value={h.offeringId}
              onChange={(e) => h.setOfferingId(e.target.value)}
              disabled={!!h.id}
            >
              <option value="">Усі студенти курсу</option>
              {props.data.offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.startDate || o.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Назва зустрічі
            <input value={h.title} onChange={(e) => h.setTitle(e.target.value)} required />
          </label>
          <label>
            Посилання Zoom
            <input
              type="url"
              value={h.url}
              onChange={(e) => h.setUrl(e.target.value)}
              placeholder="https://zoom.us/j/…"
              required
            />
          </label>
          <div className="admin-form-row">
            <label>
              Початок за Києвом
              <input
                type="datetime-local"
                value={h.start}
                onChange={(e) => h.setStart(e.target.value)}
                required
              />
            </label>
            <label>
              Завершення за Києвом
              <input
                type="datetime-local"
                value={h.end}
                onChange={(e) => h.setEnd(e.target.value)}
                required
              />
            </label>
          </div>
          <details>
            <summary>Перехід на зимовий час</summary>
            <label>
              Якщо година повторюється
              <select
                value={h.occurrence}
                onChange={(e) => h.setOccurrence(e.target.value as 'earlier' | 'later')}
              >
                <option value="earlier">Перша поява цього часу</option>
                <option value="later">Друга поява цього часу</option>
              </select>
            </label>
          </details>
          <label>
            Стан
            <select
              value={h.status}
              onChange={(e) => h.setStatus(e.target.value as LiveSession['status'])}
            >
              <option value="scheduled">Заплановано</option>
              <option value="rescheduled">Час змінено</option>
              <option value="canceled">Скасовано</option>
            </select>
          </label>
          <label>
            Запис зустрічі
            <select value={h.recording} onChange={(e) => h.setRecording(e.target.value)}>
              <option value="">Ще немає запису</option>
              {props.data.media
                .filter((m) => m.kind === 'video' && m.status === 'ready')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
            </select>
          </label>
          <div className="admin-inline-actions">
            <button type="submit" className="button" disabled={h.busy}>
              Зберегти зустріч
            </button>
            {h.id && (
              <button type="button" className="button button-secondary" onClick={h.reset}>
                Нова зустріч
              </button>
            )}
          </div>
          {h.error && (
            <p className="learning-error" role="alert">
              {h.error}
            </p>
          )}
          {h.message && <p role="status">{h.message}</p>}
        </form>
      )}
      {h.id && (
        <section className="admin-section">
          <h3>Підтвердження участі</h3>
          <p className="admin-muted">
            Список студентів і підтвердження відвідування ведуться в панелі ps-booking
          </p>
          <a
            className="button button-secondary"
            href={managementUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Керувати відвідуванням
          </a>
        </section>
      )}
    </section>
  );
}
