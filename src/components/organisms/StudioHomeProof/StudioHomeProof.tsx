import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { studioAssets } from '@/lib/studio-design/assets';
import styles from './StudioHomeProof.module.css';

export function StudioHomeProof() {
  return (
    <section
      className={styles.proof}
      data-home-section="proof"
      aria-label="Досвід ProPhoto Academy"
    >
      <p className={`${styles.label} studio-label studio-wrap`}>Знімали та навчали для</p>
      <div
        className={styles.brands}
        tabIndex={0}
        role="group"
        aria-label="Бренди, для яких ми знімали та навчали"
      >
        <div className={styles.track}>
          <StudioImage
            asset={studioAssets.artifact.logos}
            alt="Lay’s, Bang & Olufsen, Сільпо, iSpace, Динамо Київ, AllyProof, McDonald’s, Institutum, Pepsi, Novus"
            className={styles.logos}
            sizes="(max-width: 760px) 860px, 1440px"
          />
          <StudioImage
            asset={studioAssets.artifact.logos}
            alt=""
            className={styles.logos}
            sizes="(max-width: 760px) 860px, 1440px"
          />
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
