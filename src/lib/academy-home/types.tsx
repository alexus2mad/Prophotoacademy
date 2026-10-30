import type { ImageAsset } from '@/lib/content/types';
import type { InquiryContext } from '@/lib/inquiries/types';
export type AcademyDirection = {
  title: string;
  subtitle: string;
  image: ImageAsset;
  href?: string;
  inquiryTitle?: string;
  inquirySubject?: InquiryContext['subject'];
};
