'use client';
import { useImageGallery } from '@/components/molecules/ImageGalleryDialog/hooks';
import type { GalleryProps } from './types';

export function useGallery({ works, images }: GalleryProps) {
  const entries = works.flatMap((work) => {
    const image = images.find((item) => item.id === work.imageId);
    return image ? [{ ...image, id: work.id }] : [];
  });
  return { ...useImageGallery(entries.length), entries };
}
