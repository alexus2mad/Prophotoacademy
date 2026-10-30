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
