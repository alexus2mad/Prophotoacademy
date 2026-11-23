import type { CanvasDrag, SiteEditorPreviewProps } from './types';

// Listen in the frame so coordinates stay in its CSS pixels at either preview scale.
export function connectPlacementDrag(doc: Document, read: () => SiteEditorPreviewProps) {
  const win = doc.defaultView!;
  // Animate from the editor: the preview document deliberately disables its own scripts.
  const clock = win.frameElement?.ownerDocument.defaultView ?? win;
  const events = new AbortController();
  const capture = { capture: true, signal: events.signal };
  let drag: CanvasDrag | undefined;
  let frame = 0;
  let previousTime = 0;
  let suppressClick = false;
  let targets: HTMLElement[] = [];

  function sight() {
    const iframe = win.frameElement;
    if (!iframe) return { top: 0, bottom: win.innerHeight };
    const rect = iframe.getBoundingClientRect(),
      outer = iframe.ownerDocument.defaultView!;
    const scale = rect.height / (win.innerHeight || 1);
    return {
      top: Math.max(0, -rect.top / scale),
      bottom: Math.min(win.innerHeight, (outer.innerHeight - rect.top) / scale),
    };
  }
  function nearestTarget(x: number, y: number) {
    const { top, bottom } = sight();
    if (x < 0 || x > win.innerWidth || y < top || y > bottom) return;
    let distance = Infinity;
    let nearest: HTMLElement | undefined;
    for (const target of targets) {
      const bounds = target.getBoundingClientRect();
      if (!bounds.width || !bounds.height || x < bounds.left || x > bounds.right) continue;
      const delta = Math.abs(bounds.top + bounds.height / 2 - y);
      if (delta < distance) {
        distance = delta;
        nearest = target;
      }
    }
    // A large protected native section is not itself a drop zone.
    return distance <= Math.max(45, Math.min(110, (bottom - top) * 0.16)) ? nearest : undefined;
  }
  function indicate(target?: HTMLElement) {
    if (!drag || target === drag.target) return;
    delete drag.target?.dataset.dropActive;
    drag.target = target;
    if (target) target.dataset.dropActive = '';
  }
  function layout(time: number) {
    if (!drag?.indicator) return;
    if (!read().editable || !drag.grip.isConnected) {
      cancel();
      return;
    }
    const { top, bottom } = sight();
    const elapsed = Math.min(32, time - previousTime);
    previousTime = time;
    const edge = Math.min(80, Math.max(30, (bottom - top) * 0.16));
    if (drag.x >= 0 && drag.x <= win.innerWidth && drag.y >= top - 4 && drag.y <= bottom + 4) {
      const advance =
        drag.y < top + edge
          ? -Math.min(1, (top + edge - drag.y) / edge)
          : Math.max(0, Math.min(1, (drag.y - bottom + edge) / edge));
      if (advance) win.scrollBy({ top: advance * elapsed * 0.75, behavior: 'instant' });
    }
    indicate(nearestTarget(drag.x, drag.y));
    const badge = drag.indicator;
    badge.style.left =
      Math.max(4, Math.min(drag.x + 12, win.innerWidth - badge.offsetWidth - 4)) + 'px';
    badge.style.top =
      Math.max(top + 4, Math.min(drag.y + 14, bottom - badge.offsetHeight - 4)) + 'px';
    frame = clock.requestAnimationFrame(layout);
  }
  function cancel() {
    if (!drag) return;
    const old = drag;
    drag = undefined;
    clock.cancelAnimationFrame(frame);
    delete doc.documentElement.dataset.movingBlock;
    delete old.grip.dataset.canvasDragSource;
    delete old.target?.dataset.dropActive;
    old.indicator?.remove();
    if (old.grip.hasPointerCapture?.(old.pointer)) old.grip.releasePointerCapture(old.pointer);
    targets = [];
  }
  function down(e: PointerEvent) {
    if (!e.isPrimary || e.button !== 0 || !read().editable) return;
    // Touch and pen can finish a drag without a compatibility click. A new gesture is intentional.
    suppressClick = false;
    const grip = (e.target as Element)?.closest<HTMLElement>('[data-canvas-grip]');
    if (!grip || !grip.dataset.canvasGrip) return;
    cancel();
    drag = {
      id: grip.dataset.canvasGrip,
      pointer: e.pointerId,
      startedX: e.clientX,
      startedY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      grip,
    };
    grip.setPointerCapture?.(e.pointerId);
  }
  function move(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.pointer) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (!drag.indicator && Math.hypot(drag.x - drag.startedX, drag.y - drag.startedY) >= 5) {
      suppressClick = true;
      targets = Array.from(doc.querySelectorAll<HTMLElement>('[data-canvas-boundary]'));
      doc.documentElement.dataset.movingBlock = '';
      drag.grip.dataset.canvasDragSource = '';
      const badge = doc.createElement('div');
      badge.dataset.canvasFeedback = '';
      badge.textContent =
        drag.grip.parentElement?.firstElementChild?.textContent || 'Перемістити блок';
      doc.body.append(badge);
      drag.indicator = badge;
      previousTime = clock.performance.now();
      layout(previousTime);
    }
    if (drag.indicator) e.preventDefault();
  }
  function up(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.pointer) return;
    const { id, indicator } = drag;
    const target = indicator && nearestTarget(e.clientX, e.clientY);
    cancel();
    if (target?.dataset.canvasBoundary && read().editable) {
      read().onMoveTo(id, {
        slot: target.dataset.canvasBoundary,
        beforeBlockId: target.dataset.canvasBefore,
      });
      focusGrip(doc, id);
    }
  }
  doc.addEventListener('pointerdown', down, capture);
  doc.addEventListener('pointermove', move, { ...capture, passive: false });
  doc.addEventListener('pointerup', up, capture);
  doc.addEventListener(
    'pointercancel',
    (e) => {
      if (e.pointerId === drag?.pointer) cancel();
    },
    capture,
  );
  doc.addEventListener(
    'lostpointercapture',
    (e) => {
      if (e.pointerId === drag?.pointer) cancel();
    },
    capture,
  );
  doc.addEventListener(
    'keydown',
    (e) => {
      if (drag && e.key === 'Escape') {
        e.preventDefault();
        suppressClick = true;
        cancel();
      }
    },
    capture,
  );
  doc.addEventListener(
    'click',
    (e) => {
      if (!suppressClick) return;
      suppressClick = false;
      if (
        e.detail > 0 &&
        (e.target as Element)?.closest?.('[data-canvas-grip], [data-canvas-boundary]')
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    capture,
  );
  win.addEventListener('blur', cancel, { signal: events.signal });
  return () => {
    cancel();
    events.abort();
  };
}

export function focusGrip(doc: Document, id: string) {
  const clock = doc.defaultView?.frameElement?.ownerDocument.defaultView ?? doc.defaultView;
  clock?.requestAnimationFrame(() => {
    const grip = Array.from(doc.querySelectorAll<HTMLElement>('[data-canvas-grip]')).find(
      (el) => el.dataset.canvasGrip === id,
    );
    grip?.focus({ preventScroll: true });
  });
}
