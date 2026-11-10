import type { InquiryContext } from '@/lib/inquiries/types';
import type { StudioReview } from '@/lib/studio-reviews/types';

export type StudioHomeMode = 'studio' | 'academy' | 'shop';
export type StudioExposureGeometry = {
  top: number;
  height: number;
  viewportHeight: number;
  mobile: boolean;
  reducedMotion: boolean;
};
export type StudioExposureState = {
  progress: number;
  transition: number;
  activeBars: number;
  redBars: number;
  redStart: number;
  value: string;
};
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
export type StudioHomeReview = StudioReview;
export type StudioHomeWork = {
  id: string;
  image: StudioHomeAsset;
  mobileImage?: StudioHomeAsset;
  alt: string;
};
