'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { connectPreviewFrame } from './frame';
import { connectPlacementDrag, focusGrip } from './placement-drag';
import type { SiteEditorPreviewProps } from './types';
import type { PreviewHost } from './types';

export function useSiteEditorPreview(props: SiteEditorPreviewProps) {
  const [hosts, setHosts] = useState<PreviewHost[]>([]);
  const [moving, setMoving] = useState('');
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
  useEffect(() => {
    if (!props.focusNewBlock || !frame.current?.contentDocument) return;
    const doc = frame.current.contentDocument;
    const id = requestAnimationFrame(() => {
      const node = Array.from(doc.querySelectorAll<HTMLElement>('[data-block-type]')).find(
        (el) => el.dataset.siteSection === props.focusNewBlock,
      );
      node?.querySelector<HTMLElement>('[data-canvas-field]')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [props.focusNewBlock]);
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
  useLayoutEffect(() => {
    const style = frame.current?.contentDocument?.documentElement.style;
    style?.setProperty('--canvas-control-size', Math.ceil(44 / scale) + 'px');
    style?.setProperty('--canvas-control-text', 14 / scale + 'px');
  }, [scale, hosts]);
  function guardFrame(event: SyntheticEvent<HTMLIFrameElement>) {
    const doc = event.currentTarget.contentDocument;
    const view = doc?.defaultView;
    if (!doc || !view) return;
    detach.current();
    const seen = new Set<string>();
    const available = Array.from(
      doc.querySelectorAll<HTMLElement>('[data-site-composition][data-site-placement]'),
    ).filter(
      (el) => el.dataset.siteComposition === latest.current.page.path && el.dataset.sitePlacement,
    );
    const next: PreviewHost[] = [];
    for (const element of available) {
      const slot = element.dataset.sitePlacement!;
      if (seen.has(slot)) continue;
      seen.add(slot);
      element.replaceChildren();
      element.hidden = false;
      next.push({ slot, label: element.dataset.sitePlacementLabel || slot, element });
    }
    // The frame cannot run scripts. Mount the same block components from the parent editor.
    setHosts(next);
    setMoving('');
    const instance = connectPreviewFrame(
      doc,
      () => latest.current,
      (field) => {
        canvasSection.current = field.sectionId;
        latest.current.onSelect(field);
      },
    );
    canvas.current = instance;
    const disconnectDrag = connectPlacementDrag(doc, () => latest.current);
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
      disconnectDrag();
      instance.disconnect();
      canvas.current = null;
      detach.current = () => {};
    };
  }
  return {
    hosts,
    moving,
    setMoving,
    finishMove() {
      const doc = frame.current?.contentDocument;
      if (doc && moving) focusGrip(doc, moving);
      setMoving('');
    },
    width,
    setWidth,
    stage,
    frame,
    scale,
    frameHeight: Math.ceil((box.height || 640) / scale),
    guardFrame,
  };
}
