'use client';
import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { findPreviewField, previewIndex, scrollPreviewToSection } from './match';
import type { SiteEditorPreviewProps } from './types';

export function useSiteEditorPreview(props: SiteEditorPreviewProps) {
  const [width, setWidth] = useState(1280);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  }, [props]);
  useEffect(() => {
    if (window.matchMedia('(max-width: 850px)').matches) setWidth(390);
  }, []);
  useEffect(() => {
    const doc = frame.current?.contentDocument;
    const section = props.page.sections.find((s) => s.id === props.sectionId);
    if (doc && section) scrollPreviewToSection(doc, section);
  }, [props.page, props.sectionId]);
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
    if (!doc) return;
    const index = previewIndex(latest.current.page, doc.baseURI);
    const stopNavigation = (e: Event) => {
      const element = e.target as Element | null;
      if (element?.closest && e.type === 'click') {
        const { sectionId, onInspect } = latest.current;
        const field = findPreviewField(element, index, sectionId);
        if (field) {
          e.preventDefault();
          onInspect(field);
        }
      }
      if (element?.closest?.('a[href],button[type=submit],input[type=submit]')) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    doc.addEventListener('click', stopNavigation, true);
    doc.addEventListener('auxclick', stopNavigation, true);
    doc.addEventListener('submit', (e) => e.preventDefault(), true);
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
