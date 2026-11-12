'use client';

import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssets } from '@/lib/studio-design/assets';
import styles from './StudioHomeProof.module.css';
import { usePartnerRail } from './hooks';

export function StudioHomeProof() {
  const { railRef, copyCount } = usePartnerRail();
  return (
    <section
      className={styles.proof}
      data-home-section="proof"
      aria-label="Досвід ProPhoto Academy"
    >
      <p className={`${styles.label} studio-label studio-wrap`}>Знімали та навчали для</p>
      <div
        ref={railRef}
        data-partner-rail
        className={styles.brands}
        tabIndex={0}
        role="group"
        aria-label="Бренди, для яких ми знімали та навчали"
      >
        <div className={styles.track} data-partner-track>
          {Array.from({ length: copyCount }, (_, index) => (
            <div
              key={index}
              className={styles.copy}
              data-partner-copy
              aria-hidden={index > 0 ? true : undefined}
            >
              <StudioImage
                asset={studioAssets.artifact.logos}
                alt={
                  index === 0
                    ? 'Lay’s, Bang & Olufsen, Сільпо, iSpace, Динамо Київ, AllyProof, McDonald’s, Institutum, Pepsi, Novus'
                    : ''
                }
                className={styles.logos}
                sizes="(max-width: 760px) 860px, 1440px"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="studio-wrap">
        <dl className={styles.stats}>
          {[
            ['15', 'років досвіду'],
            ['3000+', 'випускників'],
            ['18+', 'навчальних груп'],
            ['100%', 'практики'],
          ].map(([value, label]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
