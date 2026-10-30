'use client';
import { Button } from '@/components/atoms/Button/Button';
import { openInquiry } from '@/lib/inquiries/events';
import type { InquiryButtonProps } from './types';

export function InquiryButton({
  children = 'Допоможіть обрати',
  programId,
  offeringId,
  packageId,
  practiceSessionId,
  title,
  subject,
  source,
  'aria-label': ariaLabel,
  className = 'button button-secondary',
}: InquiryButtonProps) {
  return (
    <Button
      className={className}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      aria-controls="inquiry-dialog"
      onClick={() =>
        openInquiry({ programId, offeringId, packageId, practiceSessionId, title, subject, source })
      }
    >
      {children}
    </Button>
  );
}
