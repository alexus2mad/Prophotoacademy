import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioMobileAction } from '@/components/molecules/StudioMobileAction/StudioMobileAction';
import { StudioShopSelection } from '@/components/organisms/StudioShopSelection/StudioShopSelection';
import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import styles from './StudioShopTemplate.module.css';

export function StudioShopTemplate() {
  return (
    <>
      <section className={`${styles.hero} studio-dark`}>
        <StudioImage
          asset={studioAssets.shop.imgHero}
          alt="Студійний портрет моделі крупним планом"
          className={styles.image}
          fit="cover"
          sizes="100vw"
          preload
        />
        <div className="studio-wrap">
          <p className={`${styles.heroLabel} studio-label`}>ProPhoto Shop</p>
          <h1>
            <span>
              <i>*</i>техніка, щоб
            </span>
            Бачити більше
          </h1>
          <a className={`${styles.heroAction} studio-button`} href={ecosystemDestinations.shop}>
            Підібрати техніку →
          </a>
        </div>
      </section>
      <StudioShopSelection shopUrl={ecosystemDestinations.shop} />
      <StudioMobileAction>
        <a className="studio-button" href={ecosystemDestinations.shop}>
          Підібрати техніку →
        </a>
      </StudioMobileAction>
    </>
  );
}
