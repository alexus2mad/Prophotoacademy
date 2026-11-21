import Link from 'next/link';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { StudioHomePicture } from '@/components/molecules/StudioHomePicture/StudioHomePicture';
import type { StudioHomeDirectionCardProps } from './types';
import styles from './StudioHomeDirectionCard.module.css';

export function StudioHomeDirectionCard({ direction, fieldPrefix }: StudioHomeDirectionCardProps) {
  const actionLabel = (
    <span className={styles.actionLabel}>
      <span data-site-field={fieldPrefix + '-action'}>{direction.action}</span>
      <span aria-hidden="true">→</span>
    </span>
  );
  return (
    <article
      className={styles.card}
      data-header-tone="dark"
      data-card-motion
      data-image-position={direction.imagePosition}
    >
      <StudioHomePicture
        fieldId={fieldPrefix + '-image'}
        mobileFieldId={fieldPrefix + '-mobile-image'}
        image={direction.image}
        mobileImage={direction.mobileImage}
        alt=""
        className={styles.image}
        sizes="(max-width: 760px) 44vw, 33vw"
      />
      <div className={styles.copy}>
        <h3 data-site-field={fieldPrefix + '-title'}>{direction.title}</h3>
        {direction.description && (
          <p data-site-field={fieldPrefix + '-description'}>{direction.description}</p>
        )}
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
