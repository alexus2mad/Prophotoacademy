'use client';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { constrainImage, imageSwipe } from './selectors';
import type {
  ImageGesture,
  ImagePoint,
  ImageSize,
  ImageTransform,
  ImageZoomProps,
  ImageZoomStyle,
} from './types';

export function useImageZoom({ onNavigate }: ImageZoomProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const natural = useRef<ImageSize>({ width: 1, height: 1 });
  const [transform, setTransform] = useState<ImageTransform>({ scale: 1, x: 0, y: 0 });
  const current = useRef(transform);
  const pointers = useRef(new Map<number, ImagePoint>());
  const gesture = useRef<ImageGesture | null>(null);
  const [loaded, setLoaded] = useState(false);
  const update = (next: ImageTransform) => {
    const element = viewport.current;
    if (!element) return;
    current.current = constrainImage(
      next,
      { width: element.clientWidth, height: element.clientHeight },
      natural.current,
    );
    setTransform(current.current);
  };
  const zoom = (scale: number) => update({ ...current.current, scale });
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => update(current.current));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 1)
      gesture.current = { origin: point, last: point, distance: 0, pinched: false };
    if (pointers.current.size === 2 && gesture.current) {
      gesture.current.distance = distance();
      gesture.current.pinched = true;
    }
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    const state = gesture.current;
    if (pointers.current.size === 2) {
      const nextDistance = distance();
      if (state.distance) zoom((current.current.scale * nextDistance) / state.distance);
      state.distance = nextDistance;
    } else if (current.current.scale > 1) {
      update({
        ...current.current,
        x: current.current.x + point.x - state.last.x,
        y: current.current.y + point.y - state.last.y,
      });
    }
    state.last = point;
  }
  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    const state = gesture.current;
    if (!pointers.current.size && state) {
      if (event.type === 'pointerup' && !state.pinched && current.current.scale === 1) {
        const direction = imageSwipe(
          event.clientX - state.origin.x,
          event.clientY - state.origin.y,
        );
        if (direction) onNavigate(direction);
      }
      gesture.current = null;
    } else if (state) {
      state.last = [...pointers.current.values()][0];
      state.distance = 0;
    }
  }
  function keyDown(event: KeyboardEvent) {
    if (event.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      update({
        ...current.current,
        x:
          current.current.x +
          (event.key === 'ArrowLeft' ? 60 : event.key === 'ArrowRight' ? -60 : 0),
        y: current.current.y + (event.key === 'ArrowUp' ? 60 : event.key === 'ArrowDown' ? -60 : 0),
      });
      return;
    }
    if (['+', '=', '-', '0'].includes(event.key)) {
      event.preventDefault();
      zoom(event.key === '0' ? 1 : current.current.scale + (event.key === '-' ? -0.5 : 0.5));
    }
  }
  const style: ImageZoomStyle = {
    '--image-scale': transform.scale,
    '--image-x': `${transform.x}px`,
    '--image-y': `${transform.y}px`,
  };
  return {
    viewport,
    transform,
    style,
    loaded,
    zoom,
    pointerDown,
    pointerMove,
    pointerEnd,
    keyDown,
    imageLoaded: (image: HTMLImageElement) => {
      natural.current = { width: image.naturalWidth, height: image.naturalHeight };
      setLoaded(true);
      update(current.current);
    },
  };
}
