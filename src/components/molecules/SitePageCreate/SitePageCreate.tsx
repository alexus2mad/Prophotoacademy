import { Button } from '@/components/atoms/Button/Button';
import { useSitePageCreate } from './hooks';
import type { SitePageCreateProps } from './types';
import styles from './SitePageCreate.module.css';

export function SitePageCreate({ busy, onCancel, onCreate }: SitePageCreateProps) {
  const h = useSitePageCreate(onCreate);
  return (
    <form className={styles.form} onSubmit={h.submit} aria-labelledby="new-page-title">
      <h2 id="new-page-title">Нова сторінка</h2>
      <fieldset disabled={busy}>
        <label>
          Назва сторінки
          <input
            autoFocus
            required
            maxLength={240}
            value={h.title}
            onChange={(e) => h.setTitle(e.target.value)}
          />
        </label>
        <label>
          Тип сторінки
          <select
            value={h.kind}
            onChange={(e) => {
              const kind = e.target.value;
              if (kind === 'course' || kind === 'workshop' || kind === 'landing') h.setKind(kind);
            }}
          >
            <option value="landing">Лендинг</option>
            <option value="course">Курс</option>
            <option value="workshop">Воркшоп</option>
          </select>
        </label>
        <label>
          Адреса сторінки
          <input
            required
            aria-describedby="new-page-path-hint"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Малі латинські літери, цифри й дефіси"
            value={h.slug}
            onChange={(e) => h.setCustomSlug(e.target.value.replace(/^\//, ''))}
          />
        </label>
        <small id="new-page-path-hint">
          {h.slug ? 'Адреса після публікації: /' + h.slug : 'Малі латинські літери, цифри й дефіси'}
        </small>
      </fieldset>
      <div>
        <Button type="submit" disabled={busy || !h.title.trim() || !h.slug}>
          {busy ? 'Створюємо…' : 'Створити чернетку'}
        </Button>
        <Button disabled={busy} className="button button-secondary" onClick={onCancel}>
          Скасувати
        </Button>
      </div>
    </form>
  );
}
