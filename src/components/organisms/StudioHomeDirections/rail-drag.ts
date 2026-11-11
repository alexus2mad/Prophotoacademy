import type { DirectionRailDrag } from './types';

const DRAG_THRESHOLD = 8;

/** Add mouse dragging to the native rail; touch, trackpad and keyboard stay native. */
export function enableDirectionRailDrag(rail: HTMLElement) {
  const browser = rail.ownerDocument.defaultView;
  if (!browser) return;
  let gesture: DirectionRailDrag | undefined;
  let suppressClick = false;

  const finish = () => {
    const pointerId = gesture?.pointerId;
    gesture = undefined;
    rail.removeAttribute('data-dragging');
    if (pointerId !== undefined && rail.hasPointerCapture(pointerId)) {
      rail.releasePointerCapture(pointerId);
    }
  };

  const start = (event: PointerEvent) => {
    finish();
    suppressClick = false;
    if (
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      rail.scrollWidth <= rail.clientWidth + 1
    )
      return;
    gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: rail.scrollLeft,
      dragging: false,
    };
  };

  const move = (event: PointerEvent) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (!gesture.dragging) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_THRESHOLD) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        finish();
        return;
      }
      gesture.dragging = true;
      suppressClick = true;
      rail.setAttribute('data-dragging', '');
      rail.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    rail.scrollLeft = Math.max(
      0,
      Math.min(rail.scrollWidth - rail.clientWidth, gesture.scrollLeft - dx),
    );
  };

  const end = (event: PointerEvent) => {
    if (event.pointerId === gesture?.pointerId) finish();
  };
  const preventLinkDrag = (event: DragEvent) => {
    if (gesture) event.preventDefault();
  };
  const preventDragClick = (event: MouseEvent) => {
    // Keyboard activation has detail 0 and must never inherit pointer suppression.
    if (suppressClick && event.detail !== 0) {
      event.preventDefault();
      event.stopPropagation();
    }
    suppressClick = false;
  };

  rail.addEventListener('pointerdown', start);
  rail.addEventListener('dragstart', preventLinkDrag);
  rail.addEventListener('click', preventDragClick, true);
  rail.addEventListener('lostpointercapture', end);
  browser.addEventListener('pointermove', move, { passive: false });
  browser.addEventListener('pointerup', end);
  browser.addEventListener('pointercancel', end);
  browser.addEventListener('blur', finish);
  return () => {
    finish();
    rail.removeEventListener('pointerdown', start);
    rail.removeEventListener('dragstart', preventLinkDrag);
    rail.removeEventListener('click', preventDragClick, true);
    rail.removeEventListener('lostpointercapture', end);
    browser.removeEventListener('pointermove', move);
    browser.removeEventListener('pointerup', end);
    browser.removeEventListener('pointercancel', end);
    browser.removeEventListener('blur', finish);
  };
}
