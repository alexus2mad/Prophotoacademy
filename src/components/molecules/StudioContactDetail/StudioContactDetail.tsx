'use client';
import { Button } from '@/components/atoms/Button/Button';
import { useContactCopy } from './hooks';
import type { StudioContactDetailProps } from './types';
import styles from './StudioContactDetail.module.css';

export function StudioContactDetail({ label, value, href }: StudioContactDetailProps) {
  const { status, copy } = useContactCopy(value);
  return (
    <div className={styles.row}>
      <dt className="studio-label">{label}</dt>
      <dd>
        <span>{href ? <a href={href}>{value}</a> : value}</span>
        <Button className={styles.copy} onClick={copy} aria-label={`Копіювати: ${label}`}>
          {status === 'copied' ? 'Скопійовано' : 'Копіювати'}
        </Button>
        <span className={styles.status} role="status">
          {status === 'failed'
            ? 'Не вдалося скопіювати. Виділіть текст і скопіюйте вручну'
            : status === 'copied'
              ? `${label} скопійовано`
              : ''}
        </span>
      </dd>
    </div>
  );
}
