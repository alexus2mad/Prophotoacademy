import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
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
      <div className={styles.brands}>
        <StudioHomePicture
          image={studioAssets.home.imgImgHome144010}
          mobileImage={studioAssets.homeMobile.imgImgHome39009}
          alt="Lay’s, Bang & Olufsen, Сільпо, iSpace, Динамо Київ, AllyProof, McDonald’s, Institutum, Pepsi, Novus"
          className={styles.logos}
          sizes="100vw"
        />
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
