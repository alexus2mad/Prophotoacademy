'use client';

import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { createHorizontalRailDrag } from '@/components/behaviors/HorizontalRail/drag';
import type { HorizontalRailController } from '@/components/behaviors/HorizontalRail/types';
import { useStudioHomeCarousel } from '@/components/molecules/StudioHomeCarousel/hooks';
import { useImageGallery } from '@/components/molecules/ImageGalleryDialog/hooks';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import type { StudioHomeWorksProps } from './types';

export function useStudioHomeWorks({ works }: StudioHomeWorksProps) {
  const carousel = useStudioHomeCarousel();
  const gallery = useImageGallery(works.length);
  const drag = useRef<HorizontalRailController | undefined>(undefined);
  useEffect(() => {
    if (!carousel.rail.current) return;
    const controller = createHorizontalRailDrag(carousel.rail.current, { inertia: true });
    drag.current = controller;
    return () => {
      controller?.destroy();
      drag.current = undefined;
    };
  }, [carousel.rail]);
  const select = (index: number) => {
    drag.current?.cancelMomentum();
    carousel.select(index);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    drag.current?.cancelMomentum();
    carousel.onKeyDown(event);
  };
  const images = works.map((work) => ({
    ...work.image,
    src: studioAssetUrl(work.image.src),
    id: work.id,
    alt: work.alt,
  }));
  return { carousel: { ...carousel, select, onKeyDown }, gallery, images };
}
