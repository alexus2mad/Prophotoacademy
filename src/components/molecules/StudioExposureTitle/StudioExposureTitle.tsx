import { homeExposureTitle } from '@/lib/site-editor/brand/home/exposure-title';
import { bindSection } from '@/lib/site-editor/bind-section';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import styles from './StudioExposureTitle.module.css';

export function StudioExposureTitle({ page }: BrandContentProps = {}) {
  const { text } = bindSection(page, homeExposureTitle);
  return (
    <h2 id="exposure-title" className={styles.title}>
      {text('title')}{' '}
      <strong>
        {text('emphasis')}
        <span className={styles.desktopComma}>,</span>
      </strong>{' '}
      {text('end')}
    </h2>
  );
}
