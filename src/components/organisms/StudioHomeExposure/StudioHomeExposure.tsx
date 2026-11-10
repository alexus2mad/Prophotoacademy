'use client';
import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioExposureTitle } from '@/components/molecules/StudioExposureTitle/StudioExposureTitle';
import { studioAssets } from '@/lib/studio-design/assets';
import { exposureBarCount } from '@/lib/studio-home/exposure';
import type { StudioExposureStyle, StudioHomeExposureProps } from './types';
import styles from './StudioHomeExposure.module.css';

export function StudioHomeExposure({ section, exposure, ready = false }: StudioHomeExposureProps) {
  const style: StudioExposureStyle = {
    '--exposure-progress': exposure.progress,
    '--exposure-transition': exposure.transition,
  };
  return (
    <section
      className={styles.exposure}
      data-home-section="exposure"
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
          <StudioExposureTitle
            progress={exposure.progress}
            transition={exposure.transition}
            ready={ready}
          />
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
