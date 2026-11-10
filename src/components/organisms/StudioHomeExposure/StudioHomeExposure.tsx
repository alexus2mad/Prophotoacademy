'use client';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssets } from '@/lib/studio-design/assets';
import { exposureBarCount } from '@/lib/studio-home/exposure';
import type { StudioExposureStyle, StudioHomeExposureProps } from './types';
import styles from './StudioHomeExposure.module.css';

export function StudioHomeExposure({ section, exposure }: StudioHomeExposureProps) {
  const style: StudioExposureStyle = {
    '--exposure-progress': exposure.progress,
    '--exposure-transition': exposure.transition,
  };
  return (
    <section
      className={styles.exposure}
      data-home-section="exposure"
      ref={section}
      style={style}
      aria-labelledby="exposure-title"
    >
      <div className={styles.stage}>
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
              <span>{exposure.value}</span>
            </div>
            <div className={styles.bars}>
              {Array.from({ length: exposureBarCount }, (_, index) => (
                <i
                  key={index}
                  className={
                    index >= exposure.redStart && index < exposure.redStart + exposure.redBars
                      ? styles.hot
                      : index < exposure.activeBars
                        ? styles.on
                        : undefined
                  }
                  style={{ height: `${14 + (index * 86) / (exposureBarCount - 1)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
