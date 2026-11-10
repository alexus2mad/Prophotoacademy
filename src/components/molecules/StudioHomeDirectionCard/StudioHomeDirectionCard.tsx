import Link from 'next/link';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import type { StudioHomeDirectionCardProps } from './types';
import styles from './StudioHomeDirectionCard.module.css';

export function StudioHomeDirectionCard({ direction }: StudioHomeDirectionCardProps) {
  const actionLabel = (
    <span className={styles.actionLabel}>
      <span>{direction.action}</span>
      <span aria-hidden="true">→</span>
    </span>
  );
  return (
    <article className={styles.card} data-header-tone="dark" data-card-motion>
      <StudioHomePicture
        image={direction.image}
        mobileImage={direction.mobileImage}
        alt=""
        className={styles.image}
        sizes="(max-width: 760px) 44vw, 33vw"
      />
      <div className={styles.copy}>
        <h3>{direction.title}</h3>
        {direction.description && <p>{direction.description}</p>}
      </div>
      {direction.href ? (
        <Link
          className={styles.action}
          href={direction.href}
          aria-label={`${direction.title}: ${direction.action}`}
        >
          {actionLabel}
        </Link>
      ) : (
        <InquiryButton
          {...direction.inquiry}
          className={styles.action}
          aria-label={`${direction.title}: ${direction.action}`}
        >
          {actionLabel}
        </InquiryButton>
      )}
    </article>
  );
}
