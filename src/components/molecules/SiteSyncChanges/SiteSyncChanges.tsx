import type { SiteSyncChangesProps } from './types';
import styles from './SiteSyncChanges.module.css';

export function SiteSyncChanges({ candidate }: SiteSyncChangesProps) {
  const { title, added, removed, changed } = candidate.changes;
  const rows = [
    ['Нові блоки', added],
    ['Змінені блоки', changed],
    ['Прибрані на staging', removed],
  ] as const;
  if (candidate.status === 'new') return <p>Нова сторінка, на проді її ще немає</p>;
  return (
    <dl className={styles.changes}>
      {title && (
        <div>
          <dt>Назва</dt>
          <dd>змінено</dd>
        </div>
      )}
      {rows
        .filter(([, items]) => items.length)
        .map(([label, items]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{items.join(', ')}</dd>
          </div>
        ))}
      {!title && rows.every(([, items]) => !items.length) && (
        <div>
          <dt>Зміни</dt>
          <dd>налаштування сторінки</dd>
        </div>
      )}
    </dl>
  );
}
