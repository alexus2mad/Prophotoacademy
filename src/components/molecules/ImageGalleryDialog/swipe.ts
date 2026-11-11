import type { GalleryDirection, GallerySwipe } from './types';

/** Swipe only the photograph; controls and native vertical scrolling keep their own gestures. */
export function attachImageGallerySwipe(
  element: HTMLElement,
  onNavigate: (direction: GalleryDirection) => void,
) {
  const pointers = new Set<number>();
  let gesture: GallerySwipe | undefined;
  let multitouch = false;

  const release = (pointerId: number) => {
    if (element.hasPointerCapture?.(pointerId)) element.releasePointerCapture?.(pointerId);
  };
  const start = (event: PointerEvent) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
      return;
    pointers.add(event.pointerId);
    if (pointers.size > 1 || !event.isPrimary) {
      multitouch = true;
      gesture = undefined;
      return;
    }
    if (multitouch) return;
    gesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    element.setPointerCapture?.(event.pointerId);
  };
  const move = (event: PointerEvent) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const dx = Math.abs(event.clientX - gesture.x);
    const dy = Math.abs(event.clientY - gesture.y);
    if (dy > 8 && dy > dx) {
      gesture = undefined;
      return;
    }
    if (dx > 8 && dx > dy && event.cancelable) event.preventDefault();
  };
  const finish = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;
    const completed = gesture?.pointerId === event.pointerId ? gesture : undefined;
    gesture = undefined;
    pointers.delete(event.pointerId);
    const canNavigate = completed && !multitouch;
    if (!pointers.size) multitouch = false;
    release(event.pointerId);
    if (!canNavigate) return;
    const dx = event.clientX - completed.x;
    const dy = event.clientY - completed.y;
    const threshold = Math.max(44, element.clientWidth * 0.08);
    if (Math.abs(dx) >= threshold && Math.abs(dx) >= Math.abs(dy) * 1.5) {
      onNavigate(dx < 0 ? 1 : -1);
    }
  };
  const cancel = (event: PointerEvent) => {
    if (gesture?.pointerId === event.pointerId) gesture = undefined;
    pointers.delete(event.pointerId);
    if (!pointers.size) multitouch = false;
    release(event.pointerId);
  };

  element.addEventListener('pointerdown', start);
  element.addEventListener('pointermove', move, { passive: false });
  element.addEventListener('pointerup', finish);
  element.addEventListener('pointercancel', cancel);
  element.addEventListener('lostpointercapture', cancel);
  return () => {
    element.removeEventListener('pointerdown', start);
    element.removeEventListener('pointermove', move);
    element.removeEventListener('pointerup', finish);
    element.removeEventListener('pointercancel', cancel);
    element.removeEventListener('lostpointercapture', cancel);
    gesture = undefined;
    for (const pointerId of pointers) release(pointerId);
    pointers.clear();
  };
}
