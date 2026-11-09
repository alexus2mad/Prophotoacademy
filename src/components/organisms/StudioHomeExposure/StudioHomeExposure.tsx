'use client';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssets } from '@/lib/studio-design/assets';
import { useStudioHomeExposure } from './hooks';
import styles from './StudioHomeExposure.module.css';

export function StudioHomeExposure() {
  const { section, progress } = useStudioHomeExposure();
  return (
    <section
      className={styles.exposure}
      data-home-section="exposure"
      ref={section}
      aria-labelledby="exposure-title"
    >
      <StudioImage
        asset={studioAssets.home.imgImgHome144002}
        alt=""
        className={styles.image}
        fit="cover"
        sizes="100vw"
      />
      <div className={`${styles.inner} studio-wrap`}>
        <h2 id="exposure-title">
          неважливо, <strong>на що ви знімаєте, важливо</strong> як ви це робите
        </h2>
        <div className={styles.meter} aria-hidden="true">
          <div className={styles.meterLabel}>
            <span>Експозиція</span>
            <span className={styles.desktopValue}>{((progress - 1) * 3).toFixed(1)} EV</span>
            <span className={styles.mobileValue}>+1.5 EV</span>
          </div>
          <div className={styles.bars}>
            {Array.from({ length: 33 }, (_, index) => (
              <i
                key={index}
                style={{
                  height: `${14 + (index * 86) / 32}%`,
                  opacity: index < Math.ceil(progress * 33) ? 1 : 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
