import { createRailMomentum } from './momentum';
import type { HorizontalRailController, HorizontalRailDrag, HorizontalRailOptions } from './types';

const DRAG_THRESHOLD = 8;

/** Add mouse dragging to the native rail; touch, trackpad and keyboard stay native. */
export function createHorizontalRailDrag(
  rail: HTMLElement,
  { inertia = false }: HorizontalRailOptions = {},
): HorizontalRailController | undefined {
  const browser = rail.ownerDocument.defaultView;
  if (!browser) return;
  const momentum = inertia ? createRailMomentum(rail, browser) : undefined;
  let gesture: HorizontalRailDrag | undefined;
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
    momentum?.stop();
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
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
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
    const elapsed = event.timeStamp - gesture.lastTime;
    if (elapsed > 0) {
      const velocity = (gesture.lastX - event.clientX) / elapsed;
      gesture.velocity = elapsed > 80 ? velocity : gesture.velocity * 0.25 + velocity * 0.75;
    }
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;
    rail.scrollLeft = Math.max(
      0,
      Math.min(rail.scrollWidth - rail.clientWidth, gesture.scrollLeft - dx),
    );
  };

  const end = (event: PointerEvent) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const velocity =
      gesture.dragging && event.timeStamp - gesture.lastTime < 80 ? gesture.velocity : 0;
    finish();
    momentum?.start(velocity);
  };
  const cancel = (event: PointerEvent) => {
    if (event.pointerId === gesture?.pointerId) finish();
  };
  const stop = () => {
    finish();
    momentum?.stop();
  };
  const cancelMomentum = () => momentum?.stop();
  const visibility = () => {
    if (rail.ownerDocument.hidden) stop();
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
  rail.addEventListener('lostpointercapture', cancel);
  browser.addEventListener('pointermove', move, { passive: false });
  browser.addEventListener('pointerup', end);
  browser.addEventListener('pointercancel', cancel);
  browser.addEventListener('blur', stop);
  if (inertia) {
    rail.addEventListener('wheel', cancelMomentum, { passive: true });
    rail.addEventListener('keydown', cancelMomentum);
    rail.ownerDocument.addEventListener('visibilitychange', visibility);
  }
  const destroy = () => {
    stop();
    rail.removeEventListener('pointerdown', start);
    rail.removeEventListener('dragstart', preventLinkDrag);
    rail.removeEventListener('click', preventDragClick, true);
    rail.removeEventListener('lostpointercapture', cancel);
    browser.removeEventListener('pointermove', move);
    browser.removeEventListener('pointerup', end);
    browser.removeEventListener('pointercancel', cancel);
    browser.removeEventListener('blur', stop);
    if (inertia) {
      rail.removeEventListener('wheel', cancelMomentum);
      rail.removeEventListener('keydown', cancelMomentum);
      rail.ownerDocument.removeEventListener('visibilitychange', visibility);
    }
  };
  return { destroy, cancelMomentum };
}

/** Backward-compatible basic dragging for browsing rails that do not opt into inertia. */
export function enableHorizontalRailDrag(rail: HTMLElement) {
  return createHorizontalRailDrag(rail)?.destroy;
}
