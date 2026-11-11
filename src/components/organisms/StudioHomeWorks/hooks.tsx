'use client';

import { useEffect } from 'react';
import { enableHorizontalRailDrag } from '@/components/behaviors/HorizontalRail/drag';
import { useStudioHomeCarousel } from '@/components/molecules/StudioHomeCarousel/hooks';
import { useImageGallery } from '@/components/molecules/ImageGalleryDialog/hooks';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import type { StudioHomeWorksProps } from './types';

export function useStudioHomeWorks({ works }: StudioHomeWorksProps) {
  const carousel = useStudioHomeCarousel();
  const gallery = useImageGallery(works.length);
  useEffect(() => {
    if (carousel.rail.current) return enableHorizontalRailDrag(carousel.rail.current);
  }, [carousel.rail]);
  const images = works.map((work) => ({
    ...work.image,
    src: studioAssetUrl(work.image.src),
    id: work.id,
    alt: work.alt,
    title: work.alt,
  }));
  return { carousel, gallery, images };
}
