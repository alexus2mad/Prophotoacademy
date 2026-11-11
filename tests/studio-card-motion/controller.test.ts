import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { observeStudioCards } from '../../src/components/behaviors/CardMotion/studio-controller';
import type { CardBounds } from '../../src/components/behaviors/CardMotion/types';
import type { TestBrowser, TestDocument } from './types';

class ElementStub extends EventTarget {
  attributes = new Set<string>();
  pending = false;
  focusVisible = false;
  parentElement: ElementStub | null = null;
  overflowX = 'visible';
  overflowY = 'visible';
  scrollLeft = 0;
  scrollWidth = 0;
  clientWidth = 0;
  constructor(public bounds: CardBounds) {
    super();
  }
  getBoundingClientRect() {
    return this.bounds;
  }
  contains(element: ElementStub): boolean {
    return (
      element === this || Boolean(element.parentElement && this.contains(element.parentElement))
    );
  }
  closest(selector: string) {
    return selector === '[data-card-motion-pending]' ? (this.pending ? this : null) : this;
  }
  setAttribute(name: string) {
    this.attributes.add(name);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  matches() {
    return this.focusVisible;
  }
}
class Preference extends EventTarget {
  matches = false;
  set(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}
class MutationStub {
  static current: MutationStub;
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(public notify: VoidFunction) {
    MutationStub.current = this;
  }
}
class ResizeStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(public notify: VoidFunction) {}
}

let cards: ElementStub[], compact: Preference, reduced: Preference, cleanup: VoidFunction;
let browser: TestBrowser;
let documentStub: TestDocument<ElementStub>;
const frames = new Map<number, FrameRequestCallback>();
const active = () =>
  cards.flatMap((card, index) => (card.attributes.has('data-card-active') ? [index] : []));
const flush = () => {
  for (const [id, callback] of [...frames]) {
    frames.delete(id);
    callback(0);
  }
};
const pointer = (target: ElementStub | null, pointerType = 'mouse', type = 'pointermove') => {
  const event = new Event(type);
  Object.defineProperties(event, {
    target: { value: target },
    pointerType: { value: pointerType },
    buttons: { value: 0 },
    clientX: { value: 100 },
    clientY: { value: 350 },
  });
  documentStub.elementFromPoint.mockReturnValue(target);
  browser.dispatchEvent(event);
  flush();
};
const key = (value: string) => {
  const event = new Event('keydown');
  Object.defineProperty(event, 'key', { value });
  browser.dispatchEvent(event);
  flush();
};
const start = (mobile = false) => {
  compact.matches = mobile;
  documentStub.documentElement.clientWidth = mobile ? 390 : 1440;
  const root = Object.assign(new ElementStub({ left: 0, right: 1440, top: 0, bottom: 2000 }), {
    querySelectorAll: () => cards,
  });
  cleanup = observeStudioCards(root as unknown as Element);
  flush();
};
beforeEach(() => {
  cards = [
    new ElementStub({ left: 0, right: 170, top: 320, bottom: 520 }),
    new ElementStub({ left: 172, right: 342, top: 320, bottom: 520 }),
    new ElementStub({ left: 344, right: 514, top: 320, bottom: 520 }),
  ];
  compact = new Preference();
  reduced = new Preference();
  frames.clear();
  browser = Object.assign(new EventTarget(), { innerHeight: 844 });
  documentStub = Object.assign(new EventTarget(), {
    hidden: false,
    activeElement: null,
    documentElement: { clientWidth: 1440 },
    elementFromPoint: vi.fn(() => null),
  });
  let frame = 0;
  vi.stubGlobal('Element', ElementStub);
  vi.stubGlobal(
    'window',
    Object.assign(browser, {
      matchMedia: (query: string) => (query.includes('reduce') ? reduced : compact),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        frames.set(++frame, callback);
        return frame;
      },
      cancelAnimationFrame: (id: number) => frames.delete(id),
    }),
  );
  vi.stubGlobal('document', documentStub);
  vi.stubGlobal('MutationObserver', MutationStub);
  vi.stubGlobal('ResizeObserver', ResizeStub);
  vi.stubGlobal('getComputedStyle', (element: ElementStub) => element);
});
afterEach(() => {
  cleanup?.();
  vi.unstubAllGlobals();
});

describe('Studio input policy', () => {
  it('ignores captured scrolling from an unrelated marquee', () => {
    start(true);
    const measurements = cards.map((card) => vi.spyOn(card, 'getBoundingClientRect'));
    const marquee = new ElementStub({ left: 0, right: 390, top: 900, bottom: 980 });
    const event = new Event('scroll');
    Object.defineProperty(event, 'target', { value: marquee });
    browser.dispatchEvent(event);
    expect(frames.size).toBe(0);
    expect(measurements.every((spy) => spy.mock.calls.length === 0)).toBe(true);
    expect(active()).toEqual([1]);
  });
  it('still measures a captured scroll from a rail containing cards', () => {
    const rail = new ElementStub({ left: 0, right: 390, top: 300, bottom: 550 });
    cards.forEach((card) => {
      card.parentElement = rail;
    });
    start(true);
    const event = new Event('scroll');
    Object.defineProperty(event, 'target', { value: rail });
    browser.dispatchEvent(event);
    expect(frames.size).toBe(1);
    flush();
    expect(active()).toEqual([1]);
  });
  it('reads shared clipping ancestors once and skips offscreen ancestor reads', () => {
    const rail = new ElementStub({ left: 0, right: 390, top: 300, bottom: 550 });
    rail.overflowX = 'hidden';
    cards[0].parentElement = rail;
    cards[1].parentElement = rail;
    const offscreenParent = new ElementStub({ left: 0, right: 390, top: 1000, bottom: 1300 });
    cards[2].parentElement = offscreenParent;
    cards[2].bounds = { left: 0, right: 170, top: 1000, bottom: 1200 };
    const styles = vi.fn((element: ElementStub) => element);
    const railBounds = vi.spyOn(rail, 'getBoundingClientRect');
    vi.stubGlobal('getComputedStyle', styles);
    start(true);
    expect(styles).toHaveBeenCalledTimes(1);
    expect(styles).toHaveBeenCalledWith(rail);
    expect(railBounds).toHaveBeenCalledTimes(1);
    expect(active()).toEqual([1]);
  });
  it('never activates a desktop row merely because scroll occurred', () => {
    start();
    browser.dispatchEvent(new Event('scroll'));
    flush();
    expect(active()).toEqual([]);
  });
  it('honors real pointer movement independently of hover media and selects only its target', () => {
    start();
    pointer(cards[0]);
    expect(active()).toEqual([0]);
    pointer(cards[1]);
    expect(active()).toEqual([1]);
    pointer(null);
    expect(active()).toEqual([]);
  });
  it('rechecks the card under a stationary desktop mouse after scrolling', () => {
    start();
    pointer(cards[0]);
    documentStub.elementFromPoint.mockReturnValue(cards[2]);
    browser.dispatchEvent(new Event('scroll'));
    flush();
    expect(active()).toEqual([2]);
    documentStub.elementFromPoint.mockReturnValue(null);
    browser.dispatchEvent(new Event('scroll'));
    flush();
    expect(active()).toEqual([]);
  });
  it('selects only one visible mobile card and updates on horizontal scrolling', () => {
    start(true);
    expect(active()).toEqual([1]);
    cards[0].bounds = { left: -130, right: 40, top: 320, bottom: 520 };
    cards[1].bounds = { left: 42, right: 212, top: 320, bottom: 520 };
    cards[2].bounds = { left: 214, right: 384, top: 320, bottom: 520 };
    browser.dispatchEvent(new Event('scroll'));
    flush();
    expect(active()).toEqual([1]);
    cards[1].bounds = { left: -90, right: 80, top: 320, bottom: 520 };
    cards[2].bounds = { left: 82, right: 252, top: 320, bottom: 520 };
    browser.dispatchEvent(new Event('scroll'));
    flush();
    expect(active()).toEqual([2]);
  });
  it('releases compact mouse hover on blank space, then resumes scroll selection', () => {
    start(true);
    pointer(cards[0]);
    expect(active()).toEqual([0]);
    pointer(null);
    expect(active()).toEqual([]);
    browser.dispatchEvent(new Event('scroll'));
    flush();
    expect(active()).toEqual([1]);
  });
  it('activates first, middle and last cards across the real 124px mobile scroll range', () => {
    const rail = new ElementStub({ left: 0, right: 375, top: 300, bottom: 750 });
    rail.overflowX = 'auto';
    rail.clientWidth = 375;
    rail.scrollWidth = 499;
    cards = [0, 167, 334].map((left) => {
      const card = new ElementStub({ left, right: left + 165, top: 320, bottom: 520 });
      card.parentElement = rail;
      return card;
    });
    start(true);
    documentStub.documentElement.clientWidth = 375;
    browser.dispatchEvent(new Event('resize'));
    flush();
    expect(active()).toEqual([0]);
    for (const [scroll, expected] of [
      [62, 1],
      [124, 2],
      [0, 0],
    ]) {
      rail.scrollLeft = scroll;
      cards.forEach((card, index) => {
        card.bounds = {
          ...card.bounds,
          left: index * 167 - scroll,
          right: index * 167 + 165 - scroll,
        };
      });
      browser.dispatchEvent(new Event('scroll'));
      flush();
      expect(active()).toEqual([expected]);
    }
  });
  it('hands off between rows while scrolling and clears when the grid leaves the viewport', () => {
    cards.push(new ElementStub({ left: 172, right: 342, top: 522, bottom: 722 }));
    const listeners = vi.spyOn(browser, 'addEventListener');
    start(true);
    expect(active()).toEqual([1]);
    expect(listeners).toHaveBeenCalledWith('scroll', expect.any(Function), {
      capture: true,
      passive: true,
    });
    for (const card of cards) {
      card.bounds = {
        ...card.bounds,
        top: card.bounds.top - 200,
        bottom: card.bounds.bottom - 200,
      };
    }
    browser.dispatchEvent(new Event('scroll'));
    flush();
    expect(active()).toEqual([3]);
    for (const card of cards) {
      card.bounds = {
        ...card.bounds,
        top: card.bounds.top - 800,
        bottom: card.bounds.bottom - 800,
      };
    }
    browser.dispatchEvent(new Event('scroll'));
    flush();
    expect(active()).toEqual([]);
  });
  it('keyboard focus takes over and actual pointer movement releases it; Escape does not change modality', () => {
    start(true);
    cards[0].focusVisible = true;
    documentStub.activeElement = cards[0];
    key('Tab');
    expect(active()).toEqual([0]);
    pointer(cards[2]);
    expect(active()).toEqual([2]);
    key('Escape');
    expect(active()).toEqual([2]);
    pointer(null);
    expect(active()).toEqual([]);
  });
  it('touch clears stale hover and allows a single target on a large touchscreen', () => {
    start();
    pointer(cards[0]);
    pointer(cards[1], 'touch', 'pointerdown');
    expect(active()).toEqual([2]);
    expect(active()).toHaveLength(1);
  });
  it('clears all animation during reduced motion, background visibility and window blur', () => {
    start(true);
    expect(active()).toEqual([1]);
    reduced.set(true);
    flush();
    expect(active()).toEqual([]);
    reduced.set(false);
    flush();
    expect(active()).toEqual([1]);
    documentStub.hidden = true;
    documentStub.dispatchEvent(new Event('visibilitychange'));
    flush();
    expect(active()).toEqual([]);
    documentStub.hidden = false;
    documentStub.dispatchEvent(new Event('visibilitychange'));
    flush();
    expect(active()).toEqual([1]);
    browser.dispatchEvent(new Event('blur'));
    flush();
    expect(active()).toEqual([]);
  });
  it('ignores pending hydration and removes active state from replaced cards', () => {
    cards[1].pending = true;
    start(true);
    expect(active()).toEqual([0]);
    cards[1].pending = false;
    MutationStub.current.notify();
    flush();
    expect(active()).toEqual([1]);
    const removed = cards[1];
    cards = [cards[0], cards[2]];
    MutationStub.current.notify();
    flush();
    expect(removed.attributes.has('data-card-active')).toBe(false);
    expect(active()).toHaveLength(1);
  });
  it('cleanup removes state and cancels queued work', () => {
    start(true);
    browser.dispatchEvent(new Event('scroll'));
    cleanup();
    flush();
    expect(active()).toEqual([]);
    pointer(cards[0]);
    expect(active()).toEqual([]);
  });
});
