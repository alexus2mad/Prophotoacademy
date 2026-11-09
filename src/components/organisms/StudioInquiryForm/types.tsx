import type { InquiryContext } from '@/lib/inquiries/types';

export type StudioInquiryFormProps = {
  context?: InquiryContext;
  id?: string;
  topic?: string;
  compact?: boolean;
};
