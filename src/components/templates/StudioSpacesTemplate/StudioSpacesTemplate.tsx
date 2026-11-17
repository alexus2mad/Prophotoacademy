import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioMobileAction } from '@/components/molecules/StudioMobileAction/StudioMobileAction';
import { StudioSpaceSections } from '@/components/organisms/StudioSpaceSections/StudioSpaceSections';
import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import type { StudioSpacesTemplateProps } from './types';
import styles from './StudioSpacesTemplate.module.css';

export function StudioSpacesTemplate({ content }: StudioSpacesTemplateProps) {
  const bookingUrl = ecosystemDestinations.studioBooking;
  return (
    <>
      <section className={`${styles.hero} studio-dark`}>
        <StudioImage
          asset={studioAssets.artifact.hero_space}
          alt="Студія ProPhoto: циклорама, рожевий фон, світло і зона візажу"
          className={styles.heroImage}
          fit="cover"
          sizes="100vw"
          preload
        />
        <div className="studio-wrap">
          <p className={`${styles.heroLabel} studio-label`}>ProPhoto Studio</p>
          <h1>
            <span>
              <i>*</i>простір, щоб
            </span>
            Бачити більше
          </h1>
          <div className={`${styles.heroActions} studio-actions`}>
            <a className="studio-button" href={bookingUrl}>
              Забронювати студію →
            </a>
            <a className="studio-button-outline" href="#spaces">
              Подивитись зали
            </a>
          </div>
        </div>
      </section>
      <StudioSpaceSections address={content.hub.address} />
      <StudioMobileAction>
        <a className="studio-button" href={bookingUrl}>
          Забронювати студію →
        </a>
      </StudioMobileAction>
    </>
  );
}
