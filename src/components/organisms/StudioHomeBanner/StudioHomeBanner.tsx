import Link from 'next/link';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import type { StudioHomeBannerProps } from './types';
import styles from './StudioHomeBanner.module.css';

export function StudioHomeBanner({ destination }: StudioHomeBannerProps) {
  const isShop = destination === 'shop';
  return (
    <section
      className={`${styles.banner} ${!isShop ? styles.studio : ''}`}
      data-home-section={destination}
      aria-label={isShop ? 'Магазин екосистеми' : 'Фотостудія в центрі Києва'}
    >
      <div className={`${styles.body} studio-wrap`}>
        <p className="studio-label">
          {isShop ? 'Магазин екосистеми' : 'Фотостудія в центрі Києва'}
        </p>
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
          <p className={`studio-lead ${styles.description}`}>
            Уся необхідна техніка для зйомки. Допоможемо підібрати під ваші задачі й бюджет.
          </p>
        )}
        <Link
          href={isShop ? ecosystemDestinations.shop : ecosystemDestinations.studioBooking}
          className={`studio-button-outline ${styles.action}`}
        >
          {isShop ? 'До магазину' : 'Забронювати зал'}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <StudioHomePicture
        image={
          isShop ? studioAssets.home.imgImgHome144015 : studioAssets.homeMobile.imgImgHome39015
        }
        mobileImage={
          isShop ? studioAssets.homeMobile.imgImgHome39014 : studioAssets.homeMobile.imgImgHome39015
        }
        alt={
          isShop
            ? 'Парасолька-відбивач для студійного світла'
            : 'Зал ProPhoto Studio зі студійним світлом і рожевим фоном'
        }
        className={`${styles.image} ${styles.academyImage}`}
        sizes="(max-width: 760px) 100vw, 50vw"
      />
      <StudioImage
        asset={
          isShop
            ? studioAssets.homeStudioMobile.imgImgHome390Studio10
            : studioAssets.homeStudioMobile.imgImgHome390Studio11
        }
        alt={
          isShop
            ? 'Парасолька-відбивач для студійного світла'
            : 'Зал ProPhoto Studio зі студійним світлом і рожевим фоном'
        }
        className={styles.alternateImage}
        sizes="100vw"
        fit="cover"
      />
    </section>
  );
}
