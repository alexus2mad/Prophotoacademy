import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioShopSelection } from '@/components/organisms/StudioShopSelection/StudioShopSelection';
import { studioAssets } from '@/lib/studio-design/assets';
import type { StudioShopTemplateProps } from './types';
import styles from './StudioShopTemplate.module.css';

export function StudioShopTemplate({ content }: StudioShopTemplateProps) {
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
          <p className="studio-label">ProPhoto Shop</p>
          <h1>
            <span>
              <i>*</i>техніка, щоб
            </span>
            Бачити більше
          </h1>
          <a className="studio-button" href="#equipment-selection">
            Підібрати техніку →
          </a>
        </div>
      </section>
      <StudioShopSelection shopUrl={content.settings.shop} />
    </>
  );
}
