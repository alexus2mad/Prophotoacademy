import { homeFounder } from '@/lib/site-editor/brand/home/founder';
import { bindSection } from '@/lib/site-editor/bind-section';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import { studioAcademyDestinations } from '@/lib/studio-pages/navigation';
import Link from 'next/link';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { studioAssets } from '@/lib/studio-design/assets';
import styles from './StudioHomeFounder.module.css';

export function StudioHomeFounder({ page }: BrandContentProps = {}) {
  const { text, image } = bindSection(page, homeFounder);
  return (
    <section
      className={styles.founder}
      data-home-section="founder"
      aria-labelledby="home-founder-title"
    >
      <StudioHomePicture
        image={image('portrait-image', studioAssets.home.imgImgHome144009)}
        mobileImage={image('portrait-mobile-image', studioAssets.homeMobile.imgImgHome39008)}
        alt={text('portrait-image-alt')}
        className={styles.portrait}
        sizes="(max-width: 760px) 100vw, 42vw"
      />
      <div className={`${styles.body} studio-wrap`}>
        <p className="studio-label">{text('eyebrow')}</p>
        <h2 className="studio-title" id="home-founder-title">
          {text('title')}
        </h2>
        <p className="studio-lead">{text('intro')}</p>
        <p className={styles.background}>{text('biography')}</p>
        <div className={`${styles.actions} studio-actions`}>
          <Link href={studioAcademyDestinations.courses} className="studio-button">
            {text('course-action')}
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.lecturers} href="/academy#lecturers">
            {text('lecturers-action')}
          </Link>
        </div>
      </div>
    </section>
  );
}
