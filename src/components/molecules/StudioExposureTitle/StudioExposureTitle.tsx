import styles from './StudioExposureTitle.module.css';

export function StudioExposureTitle() {
  return (
    <h2 id="exposure-title" className={styles.title}>
      неважливо,{' '}
      <strong>
        на що ви знімаєте, важливо<span className={styles.desktopComma}>,</span>
      </strong>{' '}
      як ви це робите
    </h2>
  );
}
