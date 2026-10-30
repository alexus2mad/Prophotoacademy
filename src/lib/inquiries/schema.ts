import { z } from 'zod';

export const inquirySubjectSchema = z.enum([
  'program-selection',
  'workshops',
  'camp',
  'individual-training',
  'corporate-training',
]);

export const inquirySourceSchema = z.enum(['homepage-card', 'header', 'consultation']);
