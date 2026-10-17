'use client';
import { useAdminPromoCodes } from './hooks';
import type { AdminPromoCodesProps } from './types';

const dateFormat = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' });
const period = (from: string | null, to: string | null) =>
  !from && !to
    ? 'Без обмеження в часі'
    : `${from ? 'з ' + dateFormat.format(new Date(from)) : ''}${from && to ? ' ' : ''}${to ? 'до ' + dateFormat.format(new Date(to)) : ''}`;

export function AdminPromoCodes(props: AdminPromoCodesProps) {
  const { codes, programs } = props;
  const h = useAdminPromoCodes(props);
  const titles = new Map(programs.map((p) => [p.id, p.title]));
  return (
    <>
      <div className="workspace-page-heading">
        <h1>Промокоди</h1>
        <p>Знижка застосовується на сервері під час оплати через WayForPay</p>
      </div>
      <section className="admin-panel">
        {codes.length ? (
          <ul className="admin-list promo-list">
            {codes.map((code) => (
              <li key={code.code}>
                <div>
                  <strong>
                    {code.code} · −{code.percent}%
                  </strong>
                  <p>
                    {period(code.startsAt, code.expiresAt)} · використано {code.uses}
                    {code.maxUses ? ` з ${code.maxUses}` : ''} ·{' '}
                    {code.programIds.length
                      ? code.programIds.map((id) => titles.get(id) || id).join(', ')
                      : 'усі програми'}
                  </p>
                  {code.note && <p>{code.note}</p>}
                </div>
                <span className="admin-badge">{code.active ? 'Активний' : 'Вимкнено'}</span>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => h.edit(code)}
                  aria-label={`Редагувати промокод ${code.code}`}
                >
                  Редагувати
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-muted">Промокодів ще немає</p>
        )}
      </section>
      <section className="admin-section admin-panel">
        <h2>{h.editing ? `Промокод ${h.editing}` : 'Новий промокод'}</h2>
        <form className="admin-form" onSubmit={h.save}>
          <div className="admin-form-row">
            <label>
              Код
              <input
                value={h.draft.code}
                onChange={(e) => h.update({ code: e.target.value.toUpperCase() })}
                readOnly={!!h.editing}
                required
                pattern="[A-Za-z0-9_\-]{3,32}"
                maxLength={32}
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <label>
              Знижка, %
              <input
                type="number"
                min={1}
                max={90}
                value={h.draft.percent}
                onChange={(e) => h.update({ percent: e.target.value })}
                required
              />
            </label>
          </div>
          <div className="admin-form-row">
            <label>
              Діє з
              <input
                type="date"
                value={h.draft.starts}
                onChange={(e) => h.update({ starts: e.target.value })}
              />
            </label>
            <label>
              Діє до (включно)
              <input
                type="date"
                value={h.draft.expires}
                min={h.draft.starts || undefined}
                onChange={(e) => h.update({ expires: e.target.value })}
              />
            </label>
          </div>
          <label>
            Максимум оплат
            <input
              type="number"
              min={1}
              max={100000}
              placeholder="Порожньо — без обмеження"
              value={h.draft.maxUses}
              onChange={(e) => h.update({ maxUses: e.target.value })}
            />
          </label>
          <fieldset>
            <legend>Програми</legend>
            <p className="admin-muted">Нічого не обрано — код діє для всіх програм і квитків</p>
            {programs.map((program) => (
              <label className="inline-check" key={program.id}>
                <input
                  type="checkbox"
                  checked={h.draft.programIds.includes(program.id)}
                  onChange={(e) =>
                    h.update({
                      programIds: e.target.checked
                        ? [...h.draft.programIds, program.id]
                        : h.draft.programIds.filter((id) => id !== program.id),
                    })
                  }
                />
                {program.title}
              </label>
            ))}
          </fieldset>
          <label>
            Нотатка для команди
            <input
              value={h.draft.note}
              maxLength={200}
              onChange={(e) => h.update({ note: e.target.value })}
            />
          </label>
          <label className="inline-check">
            <input
              type="checkbox"
              checked={h.draft.active}
              onChange={(e) => h.update({ active: e.target.checked })}
            />
            Активний
          </label>
          <div className="admin-actions">
            <button className="button" type="submit" disabled={h.busy}>
              {h.editing ? 'Зберегти зміни' : 'Створити промокод'}
            </button>
            {h.editing && (
              <button className="button button-secondary" type="button" onClick={h.reset}>
                Новий промокод
              </button>
            )}
            {h.editing && (
              <button
                className="button button-secondary"
                type="button"
                onClick={h.remove}
                disabled={h.busy}
              >
                {h.confirmingDelete ? 'Підтвердити видалення' : 'Видалити'}
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
      </section>
      <p className="admin-muted">
        Знижка не змінює вже створені замовлення. Код, який ще не використовували, можна видалити;
        використаний — лише вимкнути, бо замовлення зберігають його в історії
      </p>
    </>
  );
}
