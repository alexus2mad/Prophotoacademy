'use client';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioExposureTitle } from '@/components/molecules/StudioExposureTitle/StudioExposureTitle';
import { studioAssets } from '@/lib/studio-design/assets';
import { exposureBarCount } from '@/lib/studio-home/exposure';
import type { StudioExposureStyle, StudioHomeExposureProps } from './types';
import { useStudioHomeExposure } from './hooks';
import styles from './StudioHomeExposure.module.css';

export function StudioHomeExposure({ mode, directionsRef }: StudioHomeExposureProps) {
  const { section, exposure, ready, compact } = useStudioHomeExposure(mode, directionsRef);
  const style: StudioExposureStyle = {
    '--exposure-progress': exposure.progress,
    '--mobile-exposure': compact && ready ? exposure.progress : 0,
  };
  return (
    <section
      className={styles.exposure}
      data-home-section="exposure"
      data-header-tone={compact && exposure.progress >= 0.5 ? 'light' : 'dark'}
      data-exposure-ready={ready}
      ref={section}
      style={style}
      aria-labelledby="exposure-title"
    >
      <div className={styles.stage} data-exposure-stage>
        <StudioImage
          asset={studioAssets.home.imgImgHome144002}
          alt=""
          className={styles.image}
          fit="cover"
          sizes="100vw"
        />
        <div className={`${styles.inner} studio-wrap`}>
          <StudioExposureTitle />
          <div className={styles.meter} data-exposure-meter aria-hidden="true">
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
