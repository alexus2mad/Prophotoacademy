import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
import { shopHero } from '@/lib/site-editor/brand/shop/hero';
import { bindSection } from '@/lib/site-editor/bind-section';
import type { BrandContentProps } from '@/lib/site-editor/brand/types';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioMobileAction } from '@/components/molecules/StudioMobileAction/StudioMobileAction';
import { StudioShopSelection } from '@/components/organisms/StudioShopSelection/StudioShopSelection';
import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
import styles from './StudioShopTemplate.module.css';

export function StudioShopTemplate({ page }: BrandContentProps = {}) {
  const { text, image } = bindSection(page, shopHero);
  return (
    <>
      <section data-site-section="hero" className={`${styles.hero} studio-dark`}>
        <StudioImage
          asset={image('image', studioAssets.shop.imgHero)}
          alt={text('image-alt')}
          className={styles.image}
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
          <a className={`${styles.heroAction} studio-button`} href={ecosystemDestinations.shop}>
            {text('shop-action')}
          </a>
        </div>
      </section>
      <StudioShopSelection page={page} shopUrl={ecosystemDestinations.shop} />
      <MarketingComposition page={page} />
      <StudioMobileAction>
        <a className="studio-button" href={ecosystemDestinations.shop}>
          {text('shop-action')}
        </a>
      </StudioMobileAction>
    </>
  );
}
