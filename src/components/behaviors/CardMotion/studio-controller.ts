import { horizontalScrollFocus, selectScrollCard, visibleCardBounds } from './selection';
import type { CardAncestorGeometry, CardClip, CardInput, CardPointerPosition } from './types';

/** One presentation target, whether the visitor is pointing, scrolling or using a keyboard. */
export function observeStudioCards(root: Element) {
  const compact = window.matchMedia('(max-width: 899px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let cards: HTMLElement[] = [];
  let active: HTMLElement | null = null;
  let hovered: HTMLElement | null = null;
  let input: CardInput = null;
  let pointerPosition: CardPointerPosition | null = null;
  let frame = 0;
  let disposed = false;
  let windowFocused = true;

  const findCard = (target: EventTarget | null) => {
    const card =
      target instanceof Element ? target.closest<HTMLElement>('[data-card-motion]') : null;
    return card && cards.includes(card) ? card : null;
  };
  const activate = (next: HTMLElement | null) => {
    if (active === next) return;
    active?.removeAttribute('data-card-active');
    active = next;
    active?.setAttribute('data-card-active', '');
  };
  const measure = () => {
    frame = 0;
    if (disposed) return;
    if (reduced.matches || document.hidden || !windowFocused) {
      activate(null);
      return;
    }
    const focused = document.activeElement;
    const keyboardCard =
      input === 'keyboard' && focused?.matches(':focus-visible') ? findCard(focused) : null;
    if (keyboardCard) {
      activate(keyboardCard);
      return;
    }
    if (input === 'mouse') {
      if (pointerPosition)
        hovered = findCard(document.elementFromPoint(pointerPosition.x, pointerPosition.y));
      activate(hovered);
      return;
    }
    if (!compact.matches && input !== 'touch') {
      activate(null);
      return;
    }
    const viewport = { width: document.documentElement.clientWidth, height: window.innerHeight };
    // Siblings share clipping ancestors. Read each ancestor once, before any DOM writes.
    const ancestors = new Map<HTMLElement, CardAncestorGeometry>();
    const candidates = cards.map((card) => {
      const rectangle = card.getBoundingClientRect();
      if (!visibleCardBounds(rectangle, [], viewport))
        return { bounds: null, focusX: viewport.width / 2 };
      const clips: CardClip[] = [];
      let rail: HTMLElement | null = null;
      for (let parent = card.parentElement; parent; parent = parent.parentElement) {
        let geometry = ancestors.get(parent);
        if (!geometry) {
          const style = getComputedStyle(parent);
          const horizontal = /^(auto|scroll|hidden|clip)$/.test(style.overflowX);
          const vertical = /^(auto|scroll|hidden|clip)$/.test(style.overflowY);
          geometry = {
            clip:
              horizontal || vertical
                ? { bounds: parent.getBoundingClientRect(), horizontal, vertical }
                : null,
            rail:
              /^(auto|scroll)$/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth + 1
                ? parent
                : null,
          };
          ancestors.set(parent, geometry);
        }
        if (geometry.clip) clips.push(geometry.clip);
        rail ??= geometry.rail;
      }
      const horizontalClips = clips.filter((clip) => clip.horizontal);
      return {
        bounds: visibleCardBounds(rectangle, clips, viewport),
        focusX: rail
          ? horizontalScrollFocus(
              Math.max(0, ...horizontalClips.map((clip) => clip.bounds.left)),
              Math.min(viewport.width, ...horizontalClips.map((clip) => clip.bounds.right)),
              rectangle.right - rectangle.left,
              rail.scrollLeft,
              rail.scrollWidth - rail.clientWidth,
            )
          : viewport.width / 2,
      };
    });
    activate(
      cards[
        selectScrollCard(
          candidates.map((candidate) => candidate.bounds),
          viewport,
          active ? cards.indexOf(active) : -1,
          candidates.map((candidate) => candidate.focusX),
        )
      ] ?? null,
    );
  };
  const schedule = () => {
    if (!disposed && !frame) frame = window.requestAnimationFrame(measure);
  };
  const scan = () => {
    const next = Array.from(root.querySelectorAll<HTMLElement>('[data-card-motion]')).filter(
      (card) => !card.closest('[data-card-motion-pending]'),
    );
    for (const card of cards) {
      if (!next.includes(card)) {
        card.removeAttribute('data-card-active');
        resize?.unobserve(card);
      }
    }
    for (const card of next) {
      card.removeAttribute('data-scroll-active');
      if (!cards.includes(card)) resize?.observe(card);
    }
    cards = next;
    if (hovered && !cards.includes(hovered)) hovered = null;
    if (active && !cards.includes(active)) active = null;
    schedule();
  };
  const pointer = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' || (event.pointerType === 'pen' && event.buttons === 0)) {
      input = 'mouse';
      pointerPosition = { x: event.clientX, y: event.clientY };
      hovered = findCard(event.target);
      schedule();
    }
  };
  const pointerOut = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      hovered = findCard(event.relatedTarget);
      if (!event.relatedTarget) pointerPosition = null;
      schedule();
    }
  };
  const pointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      input = 'touch';
      hovered = null;
      pointerPosition = null;
      schedule();
    } else pointer(event);
  };
  const keyDown = (event: KeyboardEvent) => {
    if (
      ![
        'Tab',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        'PageUp',
        'PageDown',
      ].includes(event.key)
    )
      return;
    input = 'keyboard';
    hovered = null;
    schedule();
  };
  const scroll = (event: Event) => {
    const scroller = event.target;
    // A marquee or unrelated inner rail must not wake every card on the page.
    if (
      event.type === 'scroll' &&
      scroller instanceof Element &&
      !cards.some((card) => scroller.contains(card))
    )
      return;
    hovered = null;
    if (compact.matches && input === 'mouse') input = null;
    schedule();
  };
  const blur = () => {
    windowFocused = false;
    pointerPosition = null;
    hovered = null;
    input = null;
    schedule();
  };
  const focus = () => {
    windowFocused = true;
    schedule();
  };
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
  resize?.observe(root);
  const mutations = new MutationObserver(scan);
  mutations.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-card-motion-pending'],
  });
  scan();
  window.addEventListener('pointermove', pointer, { passive: true });
  window.addEventListener('pointerover', pointer, { passive: true });
  window.addEventListener('pointerout', pointerOut, { passive: true });
  window.addEventListener('pointerdown', pointerDown, { passive: true });
  window.addEventListener('keydown', keyDown);
  window.addEventListener('focusin', schedule);
  window.addEventListener('focusout', schedule);
  window.addEventListener('scroll', scroll, { capture: true, passive: true });
  window.addEventListener('resize', scroll, { passive: true });
  window.addEventListener('blur', blur);
  window.addEventListener('focus', focus);
  document.addEventListener('visibilitychange', schedule);
  compact.addEventListener('change', scroll);
  reduced.addEventListener('change', schedule);
  return () => {
    disposed = true;
    window.cancelAnimationFrame(frame);
    mutations.disconnect();
    resize?.disconnect();
    window.removeEventListener('pointermove', pointer);
    window.removeEventListener('pointerover', pointer);
    window.removeEventListener('pointerout', pointerOut);
    window.removeEventListener('pointerdown', pointerDown);
    window.removeEventListener('keydown', keyDown);
    window.removeEventListener('focusin', schedule);
    window.removeEventListener('focusout', schedule);
    window.removeEventListener('scroll', scroll, true);
    window.removeEventListener('resize', scroll);
    window.removeEventListener('blur', blur);
    window.removeEventListener('focus', focus);
    document.removeEventListener('visibilitychange', schedule);
    compact.removeEventListener('change', scroll);
    reduced.removeEventListener('change', schedule);
    activate(null);
  };
}
