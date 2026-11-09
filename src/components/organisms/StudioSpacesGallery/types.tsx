import type { ImageAsset } from '@/lib/content/types';

export type StudioSpacesGalleryProps = {
  images: { asset: Pick<ImageAsset, 'src' | 'width' | 'height'>; alt: string }[];
  label: string;
  variant?: 'room' | 'artworks';
};
