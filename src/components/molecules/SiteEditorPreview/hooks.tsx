'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { connectPreviewFrame } from './frame';
import type { SiteEditorPreviewProps } from './types';

export function useSiteEditorPreview(props: SiteEditorPreviewProps) {
  const [width, setWidth] = useState(1280);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef(props);
  const canvas = useRef<ReturnType<typeof connectPreviewFrame> | null>(null);
  const canvasSection = useRef('');
  const scrollPosition = useRef({ path: '', top: 0 });
  const detach = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    latest.current = props;
    canvas.current?.sync();
  }, [props]);
  useEffect(() => {
    if (window.matchMedia('(max-width: 850px)').matches) setWidth(390);
  }, []);
  useEffect(() => {
    if (canvasSection.current !== props.sectionId) canvas.current?.scrollToSection(props.sectionId);
    canvasSection.current = '';
  }, [props.sectionId]);
  useLayoutEffect(() => () => detach.current(), [props.savedPage.path, props.version]);
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => setBox({ width: node.clientWidth, height: node.clientHeight });
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    return () => observer.disconnect();
  }, []);
  const scale = Math.min(1, (box.width || width) / width);
  function guardFrame(event: SyntheticEvent<HTMLIFrameElement>) {
    const doc = event.currentTarget.contentDocument;
    const view = doc?.defaultView;
    if (!doc || !view) return;
    detach.current();
    const instance = connectPreviewFrame(
      doc,
      () => latest.current,
      (field) => {
        canvasSection.current = field.sectionId;
        latest.current.onSelect(field);
      },
    );
    canvas.current = instance;
    const path = latest.current.savedPage.path;
    if (scrollPosition.current.path === path)
      view.scrollTo({ top: scrollPosition.current.top, behavior: 'instant' });
    const storePosition = () => {
      scrollPosition.current = { path, top: view.scrollY };
    };
    storePosition();
    view.addEventListener('scroll', storePosition, { passive: true });
    detach.current = () => {
      view.removeEventListener('scroll', storePosition);
      instance.disconnect();
      canvas.current = null;
      detach.current = () => {};
    };
  }
  return {
    width,
    setWidth,
    stage,
    frame,
    scale,
    frameHeight: Math.ceil((box.height || 640) / scale),
    guardFrame,
  };
}
