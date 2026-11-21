import { academyCommunity } from '@/lib/site-editor/brand/academy/community';
import { bindSection } from '@/lib/site-editor/bind-section';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioAudiencePoint } from '@/components/molecules/StudioAudiencePoint/StudioAudiencePoint';
import { StudioAcademyReviews } from '@/components/organisms/StudioAcademyReviews/StudioAcademyReviews';
import { studioAssets } from '@/lib/studio-design/assets';
import { studioAcademyAudience, studioAcademyTrust } from '@/lib/studio-pages/academy';
import styles from './StudioAcademyCommunity.module.css';

// The 300px-high tablet crop needs 225px of a 3:4 source to cover the frame.
const portraitSizes = '(max-width: 760px) 36vw, (max-width: 1100px) 225px, 250px';

export function StudioAcademyCommunity({ page }: BrandContentProps = {}) {
  const { text, image } = bindSection(page, academyCommunity);
  return (
    <>
      <section data-site-section="community" id="about" className="studio-band studio-light">
        <div className="studio-wrap">
          <header className={styles.head}>
            <p className="studio-label studio-eyebrow">{text('audience-eyebrow')}</p>
            <h2 className="studio-title">
              {text('audience-title')}{' '}
              <span className="studio-hand">{text('audience-emphasis')}</span>{' '}
              {text('audience-end')}
            </h2>
            <p className="studio-lead">{text('audience-description')}</p>
          </header>
          <div className={styles.audience}>
            {studioAcademyAudience.map((point, i) => (
              <StudioAudiencePoint
                key={point.title}
                title={text('audience-' + i + '-title')}
                text={text('audience-' + i + '-description')}
              />
            ))}
          </div>
        </div>
      </section>
      <section data-site-section="community" className="studio-band studio-dark">
        <div className="studio-wrap">
          <header className={styles.head}>
            <h2 className="studio-title">{text('trust-title')}</h2>
          </header>
          <div className={styles.trust}>
            {studioAcademyTrust.map((point, i) => (
              <article className={styles.point} key={point.title}>
                <h3>{text('trust-' + i + '-title')}</h3>
                <p>{text('trust-' + i + '-description')}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section data-site-section="community" id="lecturers" className="studio-band studio-light">
        <div className="studio-wrap">
          <header className={styles.head}>
            <p className="studio-label studio-eyebrow">{text('lecturers-eyebrow')}</p>
            <h2 className="studio-title">{text('lecturers-title')}</h2>
          </header>
          <div className={styles.people}>
            <article className={styles.person}>
              <StudioImage
                asset={image('olena-image', studioAssets.academy.imgImgOlena)}
                alt={text('olena-image-alt')}
                fit="cover"
                className={styles.portrait}
                sizes={portraitSizes}
              />
              <div>
                <h3>{text('olena-name')}</h3>
                <p className="studio-label">{text('olena-role')}</p>
                <p>{text('olena-bio')}</p>
              </div>
            </article>
            <article className={styles.person}>
              <StudioImage
                asset={image('oleksandra-image', studioAssets.academy.imgImgOleksandra)}
                alt={text('oleksandra-image-alt')}
                fit="cover"
                className={styles.portrait}
                sizes={portraitSizes}
              />
              <div>
                <h3>{text('oleksandra-name')}</h3>
                <p className="studio-label">{text('oleksandra-role')}</p>
                <p>{text('oleksandra-bio')}</p>
              </div>
            </article>
          </div>
        </div>
      </section>
      <StudioAcademyReviews page={page} />
    </>
  );
}
