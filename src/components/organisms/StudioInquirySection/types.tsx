import type { ReactNode } from 'react';
import type { InquiryContext } from '@/lib/inquiries/types';

export type StudioInquirySectionProps = {
  title: string;
  hand?: string;
  description?: string;
  context?: InquiryContext;
  layout?: 'editorial' | 'balanced';
  children?: ReactNode;
};
