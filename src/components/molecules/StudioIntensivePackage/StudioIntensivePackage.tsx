import Link from 'next/link';
import type { StudioIntensivePackageProps } from './types';
import styles from './StudioIntensivePackage.module.css';

export function StudioIntensivePackage({ option }: StudioIntensivePackageProps) {
  return (
    <article className={styles.card}>
      <h3>{option.label}</h3>
      <p className={styles.price}>
        <strong>{option.price}</strong>
        <sup>грн</sup>
      </p>
      {option.purchaseUrl ? (
        <Link
          href={option.purchaseUrl}
          className={`studio-button ${styles.action}`}
          aria-label={`Придбати: ${option.label}`}
        >
          Придбати
        </Link>
      ) : option.status ? (
        <p className={styles.status}>{option.status}</p>
      ) : null}
    </article>
  );
}
