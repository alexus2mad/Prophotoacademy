const LOOP_DURATION_MS = 42_000;

/** One native scroll position serves autoplay, touch, keyboard and mouse dragging. */
export function enablePartnerMarquee(rail: HTMLElement, firstCopy: HTMLElement) {
  const document = rail.ownerDocument;
  const browser = document.defaultView;
  if (!browser) return;
  const reducedMotion = browser.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = typeof IntersectionObserver === 'undefined';
  let disposed = false;
  let hovered = browser.matchMedia('(hover: hover)').matches && rail.matches(':hover');
  let focused = rail.contains(document.activeElement);
  let loopWidth = 0;
  let frame = 0;
  let previousTime: number | undefined;
  let position = rail.scrollLeft;

  const canPlay = () =>
    !disposed &&
    visible &&
    !document.hidden &&
    !reducedMotion.matches &&
    !hovered &&
    !focused &&
    loopWidth > 0 &&
    loopWidth >= rail.clientWidth &&
    rail.scrollWidth - rail.clientWidth >= loopWidth - 1;

  const tick = (time: number) => {
    frame = 0;
    if (!canPlay()) return;
    if (previousTime !== undefined) {
      // Keep fractions: mobile motion is less than one CSS pixel per frame.
      position =
        (position + (Math.min(time - previousTime, 64) * loopWidth) / LOOP_DURATION_MS) % loopWidth;
      rail.scrollLeft = position;
    }
    previousTime = time;
    frame = browser.requestAnimationFrame(tick);
  };

  const refresh = () => {
    if (!canPlay()) {
      browser.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = undefined;
    } else if (!frame) {
      // Resume where the visitor left it, never at the original animation offset.
      position = rail.scrollLeft;
      previousTime = undefined;
      frame = browser.requestAnimationFrame(tick);
    }
  };
  const measure = () => {
    loopWidth = firstCopy.getBoundingClientRect().width;
    position = rail.scrollLeft;
    previousTime = undefined;
    refresh();
  };
  const enter = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') {
      hovered = true;
      refresh();
    }
  };
  const leave = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') {
      hovered = false;
      refresh();
    }
  };
  const focus = () => {
    focused = true;
    refresh();
  };
  const blur = () => {
    focused = false;
    refresh();
  };
  const hold = () => {
    // Retain tap-to-pause through native touch inertia, until focus leaves the rail.
    rail.focus({ preventScroll: true });
    focus();
  };
  const wheel = (event: WheelEvent) => {
    if (event.deltaX || (event.shiftKey && event.deltaY)) hold();
  };

  const visibilityObserver =
    typeof IntersectionObserver === 'undefined'
      ? undefined
      : new IntersectionObserver(([entry]) => {
          visible = entry?.isIntersecting ?? false;
          refresh();
        });
  const sizeObserver =
    typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
  visibilityObserver?.observe(rail);
  sizeObserver?.observe(rail);
  sizeObserver?.observe(firstCopy);
  rail.addEventListener('pointerenter', enter);
  rail.addEventListener('pointerleave', leave);
  rail.addEventListener('pointerdown', hold, { passive: true });
  rail.addEventListener('wheel', wheel, { passive: true });
  rail.addEventListener('focusin', focus);
  rail.addEventListener('focusout', blur);
  reducedMotion.addEventListener('change', measure);
  document.addEventListener('visibilitychange', refresh);
  browser.addEventListener('resize', measure, { passive: true });
  measure();
  return () => {
    disposed = true;
    browser.cancelAnimationFrame(frame);
    visibilityObserver?.disconnect();
    sizeObserver?.disconnect();
    rail.removeEventListener('pointerenter', enter);
    rail.removeEventListener('pointerleave', leave);
    rail.removeEventListener('pointerdown', hold);
    rail.removeEventListener('wheel', wheel);
    rail.removeEventListener('focusin', focus);
    rail.removeEventListener('focusout', blur);
    reducedMotion.removeEventListener('change', measure);
    document.removeEventListener('visibilitychange', refresh);
    browser.removeEventListener('resize', measure);
  };
}
