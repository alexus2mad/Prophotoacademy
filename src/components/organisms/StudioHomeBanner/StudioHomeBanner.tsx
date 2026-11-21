import { homeBanners } from '@/lib/site-editor/brand/home/banners';
import { bindSection } from '@/lib/site-editor/bind-section';
import Link from 'next/link';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import type { StudioHomeBannerProps } from './types';
import styles from './StudioHomeBanner.module.css';

export function StudioHomeBanner({ page, destination }: StudioHomeBannerProps) {
  const { text, image } = bindSection(page, homeBanners);
  const isShop = destination === 'shop';
  return (
    <section
      className={`${styles.banner} ${!isShop ? styles.studio : ''}`}
      data-home-section={destination}
      aria-label={text(destination + '-label')}
    >
      <div className={`${styles.body} studio-wrap`}>
        <p className="studio-label">{text(destination + '-label')}</p>
        <StudioImage
          asset={isShop ? studioAssets.home.imgLogoShop1 : studioAssets.homeMobile.imgLogoStudio1}
          alt={isShop ? 'ProPhoto Shop' : 'ProPhoto Studio'}
          className={styles.desktopLogo}
        />
        <StudioImage
          asset={
            isShop ? studioAssets.homeMobile.imgLogoShop1 : studioAssets.homeMobile.imgLogoStudio1
          }
          alt={isShop ? 'ProPhoto Shop' : 'ProPhoto Studio'}
          className={styles.mobileLogo}
        />
        {isShop && (
          <p className={`studio-lead ${styles.description}`}>{text('shop-description')}</p>
        )}
        <Link
          href={isShop ? ecosystemDestinations.shop : ecosystemDestinations.studioBooking}
          className={`studio-button-outline ${styles.action}`}
        >
          {text(destination + '-action')}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <StudioHomePicture
        image={image(
          destination + '-image',
          isShop ? studioAssets.home.imgImgHome144015 : studioAssets.homeMobile.imgImgHome39015,
        )}
        mobileImage={image(
          destination + '-mobile-image',
          isShop
            ? studioAssets.homeMobile.imgImgHome39014
            : studioAssets.homeMobile.imgImgHome39015,
        )}
        alt={text(destination + '-image-alt')}
        className={styles.image}
        sizes="(max-width: 760px) 100vw, 50vw"
      />
    </section>
  );
}
