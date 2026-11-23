'use client';

import type { DisclosurePackageCardProps } from './types';
import { usePackageDisclosure } from './hooks';
import styles from './DisclosurePackageCard.module.css';

export function DisclosurePackageCard({
  pack,
  summary,
  price,
  action,
  benefits,
  installments,
}: DisclosurePackageCardProps) {
  const { details, toggleFromCard } = usePackageDisclosure();
  return (
    <article
      className={'package-card ' + styles.card}
      data-layout="disclosure"
      data-featured={pack.featured || undefined}
      data-unavailable={pack.availability === 'soldOut'}
      onClick={toggleFromCard}
    >
      {pack.featured && (
        <span className={styles.sticker} role="img" aria-label="Найпопулярніший пакет">
          ТОП
        </span>
      )}
      <header className={styles.header} data-site-section="package-copy">
        <h3 data-site-locked="">{pack.name}</h3>
        <p data-site-field={pack.id}>{summary}</p>
      </header>
      {price}
      <details className={styles.details} ref={details} data-site-locked="">
        <summary>
          Що входить у пакет
          <span aria-hidden="true" />
        </summary>
        {installments}
        {benefits}
      </details>
      {action}
    </article>
  );
}
