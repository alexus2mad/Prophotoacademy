'use client';
import { Button } from '@/components/atoms/Button/Button';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { useSessionRoster } from './hooks';
import type { SessionRosterProps } from './types';

export function SessionRoster(props: SessionRosterProps) {
  const h = useSessionRoster(props);
  return (
    <>
      <Button className="button button-secondary" onClick={h.open}>
        Список учасників
      </Button>
      <Dialog
        dialogRef={h.dialogRef}
        closeLabel="Закрити список учасників"
        className="admin-dialog"
        aria-labelledby={`roster-${props.sessionId}`}
      >
        <h2 id={`roster-${props.sessionId}`}>{props.title}</h2>
        <p className="admin-notice">
          Участь підтверджуйте після завершення зустрічі. Відкриття Zoom-посилання не зараховується
        </p>
        {h.loading ? (
          <p className="admin-muted">Завантажуємо учасників…</p>
        ) : h.people.length ? (
          <fieldset className="admin-form">
            <legend>Студенти з доступом до уроку</legend>
            {h.people.map((person) => (
              <label className="inline-check" key={person.id}>
                <input
                  type="checkbox"
                  checked={h.selected.includes(person.id)}
                  onChange={(event) => h.toggle(person.id, event.target.checked)}
                />
                {person.name || person.email}
                {person.attended ? ' · участь підтверджено' : ''}
              </label>
            ))}
          </fieldset>
        ) : (
          !h.error && <p className="admin-muted">Студентів із доступом до цього уроку немає</p>
        )}
        <div className="admin-actions">
          <Button
            className="button"
            onClick={() => h.record(true)}
            disabled={h.busy || !h.selected.length}
          >
            Підтвердити участь
          </Button>
          <Button
            className="button button-secondary"
            onClick={() => h.record(false)}
            disabled={h.busy || !h.selected.length}
          >
            Скасувати підтвердження
          </Button>
        </div>
        {h.error && (
          <p className="learning-error" role="alert">
            {h.error}
          </p>
        )}
        {h.message && <p role="status">{h.message}</p>}
      </Dialog>
    </>
  );
}
