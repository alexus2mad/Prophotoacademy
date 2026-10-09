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
  className = 'button button-secondary',
}: InquiryButtonProps) {
  return (
    <Button
      className={className}
      onClick={() => openInquiry({ programId, offeringId, packageId, practiceSessionId, title })}
    >
      {children}
    </Button>
  );
}
