import { ChevronDown, Type } from 'lucide-react';
import type { TextStyle } from '@/lib/site-editor/types';
import type { SiteTextFormattingProps, StyleOptions } from './types';
import styles from './SiteTextFormatting.module.css';

const labels: Record<keyof TextStyle, string> = {
  font: 'Шрифт',
  size: 'Розмір',
  weight: 'Насиченість',
  color: 'Колір',
  align: 'Вирівнювання',
};
const options: StyleOptions = {
  font: { body: 'Основний', heading: 'Заголовковий', editorial: 'Рукописний' },
  size: { small: 'Малий', medium: 'Середній', large: 'Великий', display: 'Акцентний' },
  weight: { normal: 'Звичайна', bold: 'Жирна' },
  color: {
    ink: 'Темний',
    muted: 'Сірий',
    accent: 'Фірмовий червоний',
    light: 'Світлий для темного тла',
  },
  align: { start: 'Ліворуч', center: 'По центру', end: 'Праворуч' },
};

export function SiteTextFormatting({
  fieldLabel,
  style,
  disabled,
  onChange,
}: SiteTextFormattingProps) {
  function change(key: keyof TextStyle, value: string) {
    const next = { ...style };
    if (!value) delete next[key];
    else if (Object.hasOwn(options[key], value)) Object.assign(next, { [key]: value });
    onChange(Object.keys(next).length ? next : undefined);
  }
  return (
    <details className={styles.format}>
      <summary aria-label={`Оформлення тексту · ${fieldLabel}`}>
        <Type size={15} aria-hidden="true" /> Оформлення тексту
        {style && <span className={styles.changed} aria-label="Власне оформлення" />}
        <ChevronDown size={15} aria-hidden="true" />
      </summary>
      <fieldset disabled={disabled} aria-label={`Оформлення поля «${fieldLabel}»`}>
        {(Object.keys(options) as (keyof TextStyle)[]).map((key) => (
          <label key={key}>
            {labels[key]}
            <select
              aria-label={labels[key]}
              value={style?.[key] ?? ''}
              onChange={(event) => change(key, event.target.value)}
            >
              <option value="">Як у шаблоні</option>
              {Object.entries(options[key]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ))}
        {style && (
          <button type="button" onClick={() => onChange(undefined)}>
            Відновити стиль шаблону
          </button>
        )}
      </fieldset>
    </details>
  );
}
