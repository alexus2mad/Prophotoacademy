'use client';

import { useStudioAudiencePoint } from './hooks';
import type { StudioAudiencePointProps } from './types';
import styles from './StudioAudiencePoint.module.css';

export function StudioAudiencePoint({ title, text, fieldPrefix }: StudioAudiencePointProps) {
  const { desktop, open, onToggle, onSummaryClick } = useStudioAudiencePoint();
  return (
    <details className={styles.point} open={open} onToggle={onToggle}>
      <summary
        onClick={onSummaryClick}
        tabIndex={desktop ? -1 : 0}
        aria-disabled={desktop || undefined}
      >
        <h3 data-site-field={fieldPrefix && fieldPrefix + '-title'}>{title}</h3>
        <span className={styles.toggle} aria-hidden="true" />
      </summary>
      <p data-site-field={fieldPrefix && fieldPrefix + '-description'}>{text}</p>
    </details>
  );
}
