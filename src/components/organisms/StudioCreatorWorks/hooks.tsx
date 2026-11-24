'use client';
import { useState } from 'react';
import type { Work } from '@/lib/content/types';
import { useStudioGallery } from '@/components/behaviors/GalleryRail/hooks';
import { useImageGallery } from '@/components/molecules/ImageGalleryDialog/hooks';
import { creatorWorks } from './selectors';
import type { StudioCreatorWorksProps } from './types';

const defaultDevices: readonly Work['device'][] = ['camera', 'phone'];

export function useCreatorWorks(props: StudioCreatorWorksProps) {
  const all = creatorWorks(props);
  const devices = props.devices ?? defaultDevices;
  const [device, setDevice] = useState<Work['device']>(
    devices.find((option) => all.some((work) => work.device === option)) ?? devices[0],
  );
  const entries = all.filter((work) => work.device === device);
  const carousel = useStudioGallery(entries.length, true);
  const gallery = useImageGallery(entries.length);
  function selectDevice(next: Work['device']) {
    if (device === next) return;
    carousel.reset();
    setDevice(next);
  }
  return { devices, device, selectDevice, entries, carousel, gallery };
}
