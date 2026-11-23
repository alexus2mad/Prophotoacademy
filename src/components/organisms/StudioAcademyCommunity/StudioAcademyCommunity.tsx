import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
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
            <p data-site-field="audience-eyebrow" className="studio-label studio-eyebrow">
              {text('audience-eyebrow')}
            </p>
            <h2 className="studio-title">
              <SiteCopy id="audience-title">{text('audience-title')}</SiteCopy>{' '}
              <span data-site-field="audience-emphasis" className="studio-hand">
                {text('audience-emphasis')}
              </span>{' '}
              <SiteCopy id="audience-end">{text('audience-end')}</SiteCopy>
            </h2>
            <p data-site-field="audience-description" className="studio-lead">
              {text('audience-description')}
            </p>
          </header>
          <div className={styles.audience}>
            {studioAcademyAudience.map((point, i) => (
              <StudioAudiencePoint
                key={point.title}
                fieldPrefix={'audience-' + i}
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
            <h2 data-site-field="trust-title" className="studio-title">
              {text('trust-title')}
            </h2>
          </header>
          <div className={styles.trust}>
            {studioAcademyTrust.map((point, i) => (
              <article className={styles.point} key={point.title}>
                <h3 data-site-field={'trust-' + i + '-title'}>{text('trust-' + i + '-title')}</h3>
                <p data-site-field={'trust-' + i + '-description'}>
                  {text('trust-' + i + '-description')}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section data-site-section="community" id="lecturers" className="studio-band studio-light">
        <div className="studio-wrap">
          <header className={styles.head}>
            <p data-site-field="lecturers-eyebrow" className="studio-label studio-eyebrow">
              {text('lecturers-eyebrow')}
            </p>
            <h2 data-site-field="lecturers-title" className="studio-title">
              {text('lecturers-title')}
            </h2>
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
                <h3 data-site-field="olena-name">{text('olena-name')}</h3>
                <p data-site-field="olena-role" className="studio-label">
                  {text('olena-role')}
                </p>
                <p data-site-field="olena-bio">{text('olena-bio')}</p>
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
                <h3 data-site-field="oleksandra-name">{text('oleksandra-name')}</h3>
                <p data-site-field="oleksandra-role" className="studio-label">
                  {text('oleksandra-role')}
                </p>
                <p data-site-field="oleksandra-bio">{text('oleksandra-bio')}</p>
              </div>
            </article>
          </div>
        </div>
      </section>
      <StudioAcademyReviews page={page} />
    </>
  );
}
