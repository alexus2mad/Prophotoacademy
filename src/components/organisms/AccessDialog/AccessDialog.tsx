'use client';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { useAccessDialog } from './hooks';
import type { AccessAction, AccessDialogProps } from './types';

const grantActions: [AccessAction, string][] = [
  ['extend', 'Змінити термін'],
  ['upgrade', 'Змінити пакет'],
  ['migrate', 'Перевести на іншу версію'],
  ['revoke', 'Скасувати доступ'],
  ['restore', 'Відновити доступ'],
];

export function AccessDialog(props: AccessDialogProps) {
  const h = useAccessDialog(props);
  const titleId = 'access-dialog-title';
  return (
    <Dialog
      dialogRef={props.dialogRef}
      closeLabel="Закрити"
      className="admin-dialog"
      aria-labelledby={titleId}
    >
      <h2 id={titleId}>{props.grant ? 'Змінити доступ' : 'Надати доступ'}</h2>
      <form className="admin-form" onSubmit={h.save}>
        {props.grant && (
          <label>
            Дія
            <select value={h.action} onChange={(e) => h.setAction(e.target.value as AccessAction)}>
              {grantActions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Email
          <input value={props.email} readOnly />
        </label>
        {h.showMapping && (
          <>
            <label>
              Курс і версія
              <select
                value={h.releaseId}
                onChange={(e) => h.chooseRelease(e.target.value)}
                required
              >
                {h.choices.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.manifest.title} · версія {c.version}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend>Доступні уроки</legend>
              {h.release?.manifest.modules
                .flatMap((m) => m.lessons)
                .map((lesson) => (
                  <label className="inline-check" key={lesson.id}>
                    <input
                      type="checkbox"
                      checked={h.lessons.includes(lesson.id)}
                      onChange={(e) => h.toggleLesson(lesson.id, e.target.checked)}
                    />
                    {lesson.title}
                  </label>
                ))}
            </fieldset>
          </>
        )}
        <label>
          Назва пакета
          <input
            value={h.packageName}
            onChange={(e) => h.setPackageName(e.target.value)}
            required
            maxLength={100}
          />
        </label>
        {h.action !== 'revoke' && (
          <label>
            Доступ до кінця дня, UTC
            <input type="date" value={h.expires} onChange={(e) => h.setExpires(e.target.value)} />
          </label>
        )}
        <label>
          Причина зміни
          <input
            value={h.reason}
            onChange={(e) => h.setReason(e.target.value)}
            required
            minLength={3}
            maxLength={1000}
          />
        </label>
        <p className="admin-muted">
          Порожня дата означає безстроковий доступ. Прогрес зберігається. Зміна не впливає на платіж
        </p>
        <button
          className="button"
          type="submit"
          disabled={h.busy || (h.showMapping && !h.lessons.length)}
        >
          Підтвердити зміну
        </button>
        {h.error && (
          <p className="learning-error" role="alert">
            {h.error}
          </p>
        )}
        {h.message && <p role="status">{h.message}</p>}
      </form>
    </Dialog>
  );
}
