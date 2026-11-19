'use client';
import { useState } from 'react';
import type { Work } from '@/lib/content/types';
import { useStudioGallery } from '@/components/organisms/StudioSpacesGallery/hooks';
import { useImageGallery } from '@/components/molecules/ImageGalleryDialog/hooks';
import { creatorWorks } from './selectors';
import type { StudioCreatorWorksProps } from './types';

export function useCreatorWorks(props: StudioCreatorWorksProps) {
  const all = creatorWorks(props);
  const [device, setDevice] = useState<Work['device']>(
    all.some((work) => work.device === 'camera') ? 'camera' : 'phone',
  );
  const entries = all.filter((work) => work.device === device);
  const carousel = useStudioGallery(entries.length, true);
  const gallery = useImageGallery(entries.length);
  function selectDevice(next: Work['device']) {
    if (device === next) return;
    carousel.reset();
    setDevice(next);
  }
  return { device, selectDevice, entries, carousel, gallery };
}
