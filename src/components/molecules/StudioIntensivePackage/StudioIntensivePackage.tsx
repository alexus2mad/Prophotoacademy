import Link from 'next/link';
import type { StudioIntensivePackageProps } from './types';
import styles from './StudioIntensivePackage.module.css';

export function StudioIntensivePackage({ option }: StudioIntensivePackageProps) {
  const summary = (
    <>
      <h3>{option.label}</h3>
      <p className={styles.price}>
        <strong>{option.price}</strong>
        <sup>грн</sup>
      </p>
    </>
  );

  if (option.purchaseUrl) {
    return (
      <Link
        href={option.purchaseUrl}
        className={styles.card}
        aria-label={`${option.label}, ${option.price} грн — оформити квиток`}
      >
        {summary}
      </Link>
    );
  }

  return (
    <article className={styles.card}>
      {summary}
      {option.status && <p className={styles.status}>{option.status}</p>}
    </article>
  );
}
