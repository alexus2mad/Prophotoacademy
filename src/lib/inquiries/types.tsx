import type { z } from 'zod';
import type { inquirySourceSchema, inquirySubjectSchema } from './schema';

export type InquirySubject = z.infer<typeof inquirySubjectSchema>;
export type InquirySource = z.infer<typeof inquirySourceSchema>;
export type InquiryCopy = { title: string; description: string };

export type InquiryContext = {
  programId?: string;
  offeringId?: string;
  packageId?: string;
  practiceSessionId?: string;
  title?: string;
  subject?: InquirySubject;
  source?: InquirySource;
};

export type InquiryDelivery = 'delivered' | 'pending' | 'failed' | 'local' | 'canceled';
export type InquiryRecord = {
  id: string;
  createdAt: string;
  name: string;
  contact: string;
  message?: string;
  programTitle?: string;
  packageName?: string;
  topic?: string;
  source?: string;
  site?: string;
  marketingUpdates: boolean;
  delivery: InquiryDelivery;
};

export type StoredInquiry = {
  id: string;
  data: Record<string, unknown> | string;
  created_at: string | number | Date;
  state: string | null;
  attempts: number | null;
};
