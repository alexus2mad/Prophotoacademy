import Link from 'next/link';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import type { StudioHomeDirectionCardProps } from './types';
import styles from './StudioHomeDirectionCard.module.css';

export function StudioHomeDirectionCard({ direction }: StudioHomeDirectionCardProps) {
  return (
    <article className={styles.card}>
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
          <span>{direction.action}</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <InquiryButton
          {...direction.inquiry}
          className={styles.action}
          aria-label={`${direction.title}: ${direction.action}`}
        >
          <span>{direction.action}</span>
          <span aria-hidden="true">→</span>
        </InquiryButton>
      )}
    </article>
  );
}
