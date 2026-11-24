'use client';
import { useEffect, useRef, useState } from 'react';
import { previewHref } from '@/lib/site-editor/environments';
import type { PreviewDevice, PreviewVersion, SitePagePreviewProps } from './types';

const widths: Record<PreviewDevice, number> = { desktop: 1280, phone: 390 };

export function useSitePagePreview({ path, target, state }: SitePagePreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [chosen, setVersion] = useState<PreviewVersion>('draft');
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [loadedSrc, setLoadedSrc] = useState('');
  const stage = useRef<HTMLDivElement>(null);
  // A page without a draft shows its published version; one never published shows its draft.
  const comparable = state.hasDraft && state.published;
  const version: PreviewVersion = comparable ? chosen : state.hasDraft ? 'draft' : 'published';
  const src = previewHref(path, target, version);

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => setBox({ width: node.clientWidth, height: node.clientHeight });
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    return () => observer.disconnect();
  }, []);

  const width = widths[device];
  const scale = Math.min(1, (box.width || width) / width, device === 'phone' ? 0.75 : 1);
  return {
    stage,
    device,
    setDevice,
    version,
    setVersion,
    comparable,
    src,
    loading: loadedSrc !== src,
    onLoad: () => setLoadedSrc(src),
    frame: { width, height: Math.ceil((box.height || 520) / scale), scale },
  };
}
