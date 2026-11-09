import type { InquiryContext } from '@/lib/inquiries/types';

export type InquirySubmissionOptions = {
  site?: 'academy' | 'hub';
  context: InquiryContext;
};
export type InquirySubmissionState = 'idle' | 'sending' | 'success' | 'error';
