import type { ReactNode } from 'react';
import type { InquiryContext } from '@/lib/inquiries/types';

export type StudioInquirySectionProps = {
  title: string;
  hand?: string;
  description?: string;
  context?: InquiryContext;
  tone?: 'light' | 'red';
  children?: ReactNode;
};
