import type { AcademyContent, Availability } from '../content/types';
export type ProgramGalleryContent = Pick<AcademyContent, 'images' | 'works'>;
export type ProgramPresentation = {
  price?: number;
  open: boolean;
  isCustom: boolean;
  status: Availability;
  inquiryTitle: string;
  buttonLabel: string;
  hasFutureStart: boolean;
  testEnrollment?: boolean;
};
