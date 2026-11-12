const LOOP_DURATION_MS = 42_000;
const IDLE_DELAY_MS = 3_000;
const RESTART_EASING_MS = 1_000;

/** One native scroll position serves autoplay, touch, keyboard and mouse dragging. */
export function enablePartnerMarquee(rail: HTMLElement, firstCopy: HTMLElement) {
  const document = rail.ownerDocument;
  const browser = document.defaultView;
  if (!browser) return;
  const reducedMotion = browser.matchMedia('(prefers-reduced-motion: reduce)');
  const now = () => browser.performance.now();
  let visible = typeof IntersectionObserver === 'undefined';
  let disposed = false;
  let keyboardFocused =
    rail.contains(document.activeElement) && !rail.hasAttribute('data-pointer-focus');
  let pointerHeld = false;
  let pointerId: number | undefined;
  let touching = false;
  let loopWidth = 0;
  let frame = 0;
  let resumeTimer = 0;
  let resumeAt = 0;
  let easingElapsed = 0;
  let previousTime: number | undefined;
  let position = rail.scrollLeft;
  let expectedScroll = rail.scrollLeft;

  const canRun = () =>
    !disposed &&
    visible &&
    !document.hidden &&
    !reducedMotion.matches &&
    !keyboardFocused &&
    !pointerHeld &&
    !touching &&
    loopWidth > 0 &&
    rail.scrollWidth - rail.clientWidth >= loopWidth - 1;

  const stopFrame = () => {
    browser.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = undefined;
  };
  const clearResume = () => {
    browser.clearTimeout(resumeTimer);
    resumeTimer = 0;
  };
  const tick = (time: number) => {
    frame = 0;
    if (!canRun() || now() < resumeAt) return;
    if (previousTime !== undefined) {
      const elapsed = Math.min(time - previousTime, 64);
      easingElapsed = Math.min(RESTART_EASING_MS, easingElapsed + elapsed);
      const phase = easingElapsed / RESTART_EASING_MS;
      const speed = phase * phase * (3 - 2 * phase);
      // Keep fractions: mobile motion is less than one CSS pixel per frame.
      position = (position + (elapsed * loopWidth * speed) / LOOP_DURATION_MS) % loopWidth;
      rail.scrollLeft = position;
      // The browser may round/clamp scrollLeft. Its resulting value identifies
      // our own asynchronous scroll event without mistaking it for a new swipe.
      expectedScroll = rail.scrollLeft;
    }
    previousTime = time;
    frame = browser.requestAnimationFrame(tick);
  };

  const refresh = () => {
    clearResume();
    if (!canRun()) {
      stopFrame();
      return;
    }
    const remaining = resumeAt - now();
    if (remaining > 0) {
      stopFrame();
      resumeTimer = browser.setTimeout(refresh, remaining);
    } else if (!frame) {
      // Resume from the visitor's position; never jump back to the initial offset.
      position = rail.scrollLeft;
      expectedScroll = rail.scrollLeft;
      previousTime = undefined;
      frame = browser.requestAnimationFrame(tick);
    }
  };
  const interact = () => {
    resumeAt = now() + IDLE_DELAY_MS;
    easingElapsed = 0;
    refresh();
  };
  const measure = () => {
    if (disposed) return;
    loopWidth = firstCopy.getBoundingClientRect().width;
    position = rail.scrollLeft;
    expectedScroll = rail.scrollLeft;
    previousTime = undefined;
    refresh();
  };
  const pointerFocus = () => {
    keyboardFocused = false;
    // Safari can otherwise show a keyboard outline after programmatic touch focus.
    rail.setAttribute('data-pointer-focus', '');
    rail.focus({ preventScroll: true });
  };
  const press = (event: PointerEvent) => {
    if (event.isPrimary === false) return;
    pointerHeld = true;
    pointerId = event.pointerId;
    pointerFocus();
    interact();
  };
  const move = (event: PointerEvent) => {
    if (pointerHeld && event.pointerId === pointerId) interact();
  };
  const release = (event: PointerEvent) => {
    if (!pointerHeld || event.pointerId !== pointerId) return;
    pointerHeld = false;
    pointerId = undefined;
    interact();
  };
  const touchStart = () => {
    // Native panning cancels PointerEvents before the finger lifts. Keep the
    // gesture paused until touchend, then let scroll events cover its inertia.
    touching = true;
    pointerFocus();
    interact();
  };
  const touchEnd = (event: TouchEvent) => {
    if (!touching) return;
    touching = event.touches.length > 0;
    interact();
  };
  const windowBlur = () => {
    pointerHeld = false;
    pointerId = undefined;
    touching = false;
    interact();
  };
  const focus = () => {
    keyboardFocused = !rail.hasAttribute('data-pointer-focus');
    refresh();
  };
  const blur = () => {
    keyboardFocused = false;
    rail.removeAttribute('data-pointer-focus');
    interact();
  };
  const keyboard = () => {
    keyboardFocused = true;
    rail.removeAttribute('data-pointer-focus');
    interact();
  };
  const wheel = (event: WheelEvent) => {
    if (!event.deltaX && !(event.shiftKey && event.deltaY)) return;
    pointerFocus();
    interact();
  };
  const scroll = () => {
    if (rail.scrollLeft === expectedScroll) return;
    expectedScroll = rail.scrollLeft;
    interact();
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
  // React only changes the bounded copy count on resize. Observe its committed
  // track size without reinstalling this controller and losing the idle deadline.
  if (rail.firstElementChild) sizeObserver?.observe(rail.firstElementChild);
  rail.addEventListener('pointerdown', press, { passive: true });
  rail.addEventListener('lostpointercapture', release);
  rail.addEventListener('touchstart', touchStart, { passive: true });
  rail.addEventListener('wheel', wheel, { passive: true });
  rail.addEventListener('scroll', scroll, { passive: true });
  rail.addEventListener('keydown', keyboard);
  rail.addEventListener('focusin', focus);
  rail.addEventListener('focusout', blur);
  browser.addEventListener('pointermove', move, { passive: true });
  browser.addEventListener('pointerup', release);
  browser.addEventListener('pointercancel', release);
  browser.addEventListener('touchend', touchEnd, { passive: true });
  browser.addEventListener('touchcancel', touchEnd, { passive: true });
  browser.addEventListener('blur', windowBlur);
  reducedMotion.addEventListener('change', measure);
  document.addEventListener('visibilitychange', refresh);
  browser.addEventListener('resize', measure, { passive: true });
  measure();
  return () => {
    disposed = true;
    clearResume();
    stopFrame();
    visibilityObserver?.disconnect();
    sizeObserver?.disconnect();
    rail.removeEventListener('pointerdown', press);
    rail.removeEventListener('lostpointercapture', release);
    rail.removeEventListener('touchstart', touchStart);
    rail.removeEventListener('wheel', wheel);
    rail.removeEventListener('scroll', scroll);
    rail.removeEventListener('keydown', keyboard);
    rail.removeAttribute('data-pointer-focus');
    rail.removeEventListener('focusin', focus);
    rail.removeEventListener('focusout', blur);
    browser.removeEventListener('pointermove', move);
    browser.removeEventListener('pointerup', release);
    browser.removeEventListener('pointercancel', release);
    browser.removeEventListener('touchend', touchEnd);
    browser.removeEventListener('touchcancel', touchEnd);
    browser.removeEventListener('blur', windowBlur);
    reducedMotion.removeEventListener('change', measure);
    document.removeEventListener('visibilitychange', refresh);
    browser.removeEventListener('resize', measure);
  };
}
