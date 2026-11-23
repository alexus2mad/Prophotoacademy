import type { SitePatternPreviewProps } from './types';
import styles from './SitePatternPreview.module.css';

export function SitePatternPreview({ pattern }: SitePatternPreviewProps) {
  return (
    <span className={styles.preview} data-pattern={pattern} aria-hidden="true">
      <span className={styles.layout}>
        <i />
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
