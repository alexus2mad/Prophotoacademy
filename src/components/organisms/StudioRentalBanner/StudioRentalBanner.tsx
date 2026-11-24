import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { creatorAssets } from '@/lib/studio-creator/assets';
import { studioAssets } from '@/lib/studio-design/assets';
import { ecosystemDestinations } from '@/lib/ecosystem';
import styles from './StudioRentalBanner.module.css';

export function StudioRentalBanner() {
  return (
    <aside className={`${styles.studio} studio-dark`} aria-label="Фотостудія ProPhoto">
      <div className={`${styles.studioCopy} studio-wrap`}>
        <p className="studio-label studio-eyebrow">Фотостудія екосистеми</p>
        <StudioImage
          asset={studioAssets.menu.imgLogoStudio}
          alt="ProPhoto Studio"
          sizes="355px"
          fit="contain"
        />
        <a href={ecosystemDestinations.studioBooking} className="studio-button-outline">
          Забронювати зал<span aria-hidden="true">→</span>
        </a>
      </div>
      <StudioImage
        asset={creatorAssets.studio}
        alt="Світлий зал фотостудії ProPhoto"
        className={styles.studioPhoto}
        sizes="(max-width:760px) 100vw, 50vw"
        fit="cover"
      />
    </aside>
  );
}
