import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
import { homeExposureTitle } from '@/lib/site-editor/brand/home/exposure-title';
import { bindSection } from '@/lib/site-editor/bind-section';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import styles from './StudioExposureTitle.module.css';

export function StudioExposureTitle({ page }: BrandContentProps = {}) {
  const { text } = bindSection(page, homeExposureTitle);
  return (
    <h2 data-site-section="exposure-title" id="exposure-title" className={styles.title}>
      <SiteCopy id="title">{text('title')}</SiteCopy>{' '}
      <strong>
        <SiteCopy id="emphasis">{text('emphasis')}</SiteCopy>
        <span className={styles.desktopComma}>,</span>
      </strong>{' '}
      <SiteCopy id="end">{text('end')}</SiteCopy>
    </h2>
  );
}
