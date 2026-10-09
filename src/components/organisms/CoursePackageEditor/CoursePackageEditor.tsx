'use client';
import { useCoursePackageEditor } from './hooks';
import type { CoursePackageEditorProps } from './types';
export function CoursePackageEditor(props: CoursePackageEditorProps) {
  const h = useCoursePackageEditor(props);
  return (
    <section className="admin-section admin-panel">
      <h2>Доступ за пакетами</h2>
      {!props.data.releases.length ? (
        <p>
          Спочатку опублікуйте навчальні матеріали. До налаштування пакета автоматична покупка цього
          курсу недоступна
        </p>
      ) : (
        <form className="admin-form" onSubmit={h.save}>
          <div className="admin-form-row">
            <label>
              Набір
              <select
                value={h.offeringId}
                onChange={(e) => {
                  h.setOffering(e.target.value);
                  h.selectPackage('');
                }}
              >
                {props.data.offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.startDate || 'У власному темпі'} · {o.format}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Пакет
              <select
                value={h.packageId}
                onChange={(e) => h.selectPackage(e.target.value)}
                required
              >
                <option value="">Оберіть пакет</option>
                {h.offering?.packages.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {h.packageId && (
            <p className="admin-notice">
              Умови публічної пропозиції:{' '}
              {h.offering?.packages.find((p) => p.id === h.packageId)?.includes.join(' · ')}
            </p>
          )}
          <label>
            Версія програми
            <select
              value={h.releaseId}
              onChange={(e) => {
                h.setRelease(e.target.value);
                h.setLessons([]);
              }}
            >
              {props.data.releases.map((r) => (
                <option key={r.id} value={r.id}>
                  Версія {r.version}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-form-row">
            <label>
              Місяців доступу
              <input
                type="number"
                min={1}
                max={120}
                placeholder="Порожньо — безстроково"
                value={h.months}
                onChange={(e) => h.setMonths(e.target.value)}
              />
            </label>
            <label>
              Початок набору, UTC
              <input
                type="datetime-local"
                value={h.starts}
                onChange={(e) => h.setStarts(e.target.value)}
              />
            </label>
          </div>
          <p className="admin-muted">
            Відлік починається з пізнішої дати: оплата або початок набору. Вступні матеріали
            доступні одразу
          </p>
          <fieldset>
            <legend>Доступні уроки</legend>
            {h.release?.manifest.modules
              .flatMap((m) => m.lessons)
              .map((l) => (
                <label className="inline-check" key={l.id}>
                  <input
                    type="checkbox"
                    checked={h.lessons.includes(l.id)}
                    onChange={(e) =>
                      h.setLessons(
                        e.target.checked
                          ? [...h.lessons, l.id]
                          : h.lessons.filter((id) => id !== l.id),
                      )
                    }
                  />
                  {l.title}
                </label>
              ))}
          </fieldset>
          <button className="button" type="submit" disabled={h.busy || !h.lessons.length}>
            Зберегти умови доступу
          </button>
          {h.error && (
            <p className="learning-error" role="alert">
              {h.error}
            </p>
          )}
          {h.message && <p role="status">{h.message}</p>}
        </form>
      )}
    </section>
  );
}
