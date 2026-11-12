'use client';

import { studioAssets } from '@/lib/studio-design/assets';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import styles from './StudioHomeProof.module.css';
import { usePartnerRail } from './hooks';

const strip = studioAssets.artifact.logos;
const stripImage = `url("${studioAssetUrl(strip.src)}")`;

// Source rectangles include a small margin around each mark's visible pixels.
const logos = [
  { name: 'Lay’s', x: 30, y: 32, width: 131, height: 126 },
  { name: 'Bang & Olufsen', x: 347, y: 67, width: 293, height: 57 },
  { name: 'Сільпо', x: 825, y: 51, width: 210, height: 88 },
  { name: 'iSpace', x: 1219, y: 63, width: 246, height: 65 },
  { name: 'Динамо Київ', x: 1649, y: 33, width: 79, height: 125 },
  { name: 'AllyProof', x: 1877, y: 71, width: 365, height: 81 },
  { name: 'McDonald’s', x: 2389, y: 42, width: 130, height: 106 },
  { name: 'Instytutum', x: 2705, y: 58, width: 334, height: 75 },
  { name: 'Pepsi', x: 3223, y: 49, width: 233, height: 93 },
  { name: 'Novus', x: 3641, y: 63, width: 289, height: 65 },
];

const partnerNames = logos.map(({ name }) => name).join(', ');

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
              role={index === 0 ? 'img' : undefined}
              aria-label={index === 0 ? partnerNames : undefined}
            >
              {logos.map(({ name, x, y, width, height }) => (
                <span
                  key={name}
                  className={styles.logo}
                  aria-hidden="true"
                  style={{
                    width: `calc(var(--strip-height) * ${width / strip.height})`,
                    height: `calc(var(--strip-height) * ${height / strip.height})`,
                    backgroundImage: stripImage,
                    backgroundPosition: `${(x / (strip.width - width)) * 100}% ${(y / (strip.height - height)) * 100}%`,
                  }}
                />
              ))}
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
