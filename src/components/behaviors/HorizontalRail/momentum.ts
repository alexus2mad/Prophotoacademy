const DECAY_MS = 230;
const MIN_SPEED = 0.02;
const MAX_SPEED = 3;
const MAX_DURATION_MS = 1500;

/** One short, cancellable coast after a mouse release; touch momentum stays native. */
export function createRailMomentum(rail: HTMLElement, browser: Window) {
  const reducedMotion = browser.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let speed = 0;
  let position = 0;
  let previousTime = 0;
  let startedAt = 0;

  const stop = () => {
    browser.cancelAnimationFrame(frame);
    frame = 0;
    rail.removeAttribute('data-coasting');
  };

  const tick = (time: number) => {
    frame = 0;
    if (rail.ownerDocument.hidden || reducedMotion.matches || time - startedAt > MAX_DURATION_MS)
      return stop();
    const elapsed = Math.min(32, Math.max(0, time - previousTime));
    const decay = Math.exp(-elapsed / DECAY_MS);
    const maximum = Math.max(0, rail.scrollWidth - rail.clientWidth);
    position = Math.max(0, Math.min(maximum, position + speed * DECAY_MS * (1 - decay)));
    speed *= decay;
    rail.scrollLeft = position;
    previousTime = time;
    if (Math.abs(speed) < MIN_SPEED || position <= 0 || position >= maximum) return stop();
    frame = browser.requestAnimationFrame(tick);
  };

  const start = (velocity: number) => {
    stop();
    if (reducedMotion.matches || rail.ownerDocument.hidden || Math.abs(velocity) < MIN_SPEED)
      return;
    speed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, velocity));
    position = rail.scrollLeft;
    previousTime = browser.performance.now();
    startedAt = previousTime;
    rail.setAttribute('data-coasting', '');
    frame = browser.requestAnimationFrame(tick);
  };

  return { start, stop };
}
