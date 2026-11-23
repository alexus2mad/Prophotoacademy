import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { studioHero } from '@/lib/site-editor/brand/studio/hero';
import { bindSection } from '@/lib/site-editor/bind-section';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioMobileAction } from '@/components/molecules/StudioMobileAction/StudioMobileAction';
import { StudioSpaceSections } from '@/components/organisms/StudioSpaceSections/StudioSpaceSections';
import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import type { StudioSpacesTemplateProps } from './types';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
import styles from './StudioSpacesTemplate.module.css';

export function StudioSpacesTemplate({ page, content }: StudioSpacesTemplateProps) {
  const { text, image } = bindSection(page, studioHero);
  const bookingUrl = ecosystemDestinations.studioBooking;
  return (
    <>
      <MarketingSlot page={page} id="hero" />
      <section data-site-section="hero" className={`${styles.hero} studio-dark`}>
        <StudioImage
          asset={image('image', studioAssets.artifact.hero_space)}
          alt={text('image-alt')}
          className={styles.heroImage}
          fit="cover"
          sizes="100vw"
          preload
        />
        <div className="studio-wrap">
          <p data-site-field="eyebrow" className={`${styles.heroLabel} studio-label`}>
            {text('eyebrow')}
          </p>
          <h1>
            <span>
              <i>*</i>
              <SiteCopy id="emphasis">{text('emphasis')}</SiteCopy>
            </span>
            <SiteCopy id="title">{text('title')}</SiteCopy>
          </h1>
          <div className={`${styles.heroActions} studio-actions`}>
            <a className="studio-button" href={bookingUrl}>
              {text('book-action')}
            </a>
            <a className="studio-button-outline" href="#spaces">
              {text('rooms-action')}
            </a>
          </div>
        </div>
      </section>
      <StudioSpaceSections page={page} address={content.hub.address} />
      <MarketingComposition page={page} />
      <StudioMobileAction>
        <a className="studio-button" href={bookingUrl}>
          {text('book-action')}
        </a>
      </StudioMobileAction>
    </>
  );
}
