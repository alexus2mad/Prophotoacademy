import type { InquiryContext } from '@/lib/inquiries/types';

export type StudioHomeMode = 'studio' | 'academy' | 'shop';
export type StudioHomeAsset = { src: string; width: number; height: number };
export type StudioHomeDirection = {
  title: string;
  description?: string;
  action: string;
  image: StudioHomeAsset;
  mobileImage?: StudioHomeAsset;
  href?: string;
  inquiry?: InquiryContext;
};
export type StudioHomeReview = { name: string; title: string; quote: string };
export type StudioHomeWork = {
  id: string;
  image: StudioHomeAsset;
  mobileImage?: StudioHomeAsset;
  alt: string;
};
