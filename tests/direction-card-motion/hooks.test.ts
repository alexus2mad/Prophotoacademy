import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { EffectCallback } from 'react';
import type { MotionCard, MotionObserverCallback } from './types';
import { useCardMotion } from '../../src/components/behaviors/CardMotion/hooks';

const lifecycle = vi.hoisted(() => ({ cleanup: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => '/courses' }));
vi.mock('react', () => ({
  useEffect(effect: EffectCallback) {
    const cleanup = effect();
    lifecycle.cleanup.mockImplementation(() => {
      if (typeof cleanup === 'function') cleanup();
    });
  },
}));
class Card {
  active = false;
  pending = false;
  closest(selector: string) {
    return selector === '[data-card-motion-pending]' && this.pending ? this : null;
  }
  toggleAttribute(name: string, active: boolean) {
    if (name === 'data-scroll-active') this.active = active;
  }
  removeAttribute(name: string) {
    if (name === 'data-scroll-active') this.active = false;
  }
}
class Preference extends EventTarget {
  matches = false;
  set(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}
class Observer {
  static instances: Observer[] = [];
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  constructor(
    readonly notify: MotionObserverCallback,
    readonly options: IntersectionObserverInit,
  ) {
    Observer.instances.push(this);
  }
  emit(target: MotionCard, isIntersecting: boolean) {
    this.notify([{ target, isIntersecting }]);
  }
}
class MutationObserverStub {
  static instances: MutationObserverStub[] = [];
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(readonly notify: VoidFunction) {
    MutationObserverStub.instances.push(this);
  }
}
let cards: Card[], mobile: Preference, reduced: Preference;
const root = { querySelectorAll: vi.fn(() => cards) };
const frames = new Map<number, FrameRequestCallback>();
const browser = Object.assign(new EventTarget(), { innerHeight: 844 });
const flush = () => {
  for (const [id, callback] of [...frames]) {
    frames.delete(id);
    callback(0);
  }
};
beforeEach(() => {
  cards = [new Card(), new Card()];
  mobile = new Preference();
  mobile.matches = true;
  reduced = new Preference();
  Observer.instances = [];
  MutationObserverStub.instances = [];
  root.querySelectorAll.mockClear();
  browser.innerHeight = 844;
  frames.clear();
  let nextFrame = 0;
  vi.stubGlobal(
    'window',
    Object.assign(browser, {
      IntersectionObserver: Observer,
      matchMedia: (query: string) => (query.includes('reduce') ? reduced : mobile),
    }),
  );
  vi.stubGlobal('document', { querySelector: vi.fn(() => root) });
  vi.stubGlobal('IntersectionObserver', Observer);
  vi.stubGlobal('MutationObserver', MutationObserverStub);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});
afterEach(() => {
  lifecycle.cleanup();
  vi.unstubAllGlobals();
});
it('leaves cards usable without IntersectionObserver support', () => {
  vi.stubGlobal('window', {});
  expect(() => useCardMotion()).not.toThrow();
  expect(Observer.instances).toHaveLength(0);
  expect(cards.every((card) => !card.active)).toBe(true);
});
it('does not observe Hub or learning content outside the public Academy shell', () => {
  vi.stubGlobal('document', { querySelector: vi.fn(() => null) });
  useCardMotion();
  expect(document.querySelector).toHaveBeenCalledWith('.academy-editorial');
  expect(Observer.instances).toHaveLength(0);
  expect(MutationObserverStub.instances).toHaveLength(0);
});
it('activates cards at the viewport-height center line and clears them on exit', () => {
  useCardMotion();
  const observer = Observer.instances[0];
  expect(observer.options.rootMargin).toBe('-421px 0px -421px 0px');
  expect(observer.observe).toHaveBeenCalledTimes(2);
  expect(root.querySelectorAll).toHaveBeenCalledWith('[data-card-motion]');
  observer.emit(cards[0], true);
  observer.emit(cards[1], true);
  expect(cards.every((card) => card.active)).toBe(true); // A tablet row can share the center.
  observer.emit(cards[0], false);
  expect(cards.map((card) => card.active)).toEqual([false, true]);
});
it('tracks filtered cards without restarting unchanged cards or reviving removed ones', () => {
  useCardMotion();
  const observer = Observer.instances[0];
  const removed = cards[0];
  observer.emit(removed, true);
  const added = new Card();
  cards = [cards[1], added];
  MutationObserverStub.instances[0].notify();
  expect(observer.unobserve).toHaveBeenCalledWith(removed);
  expect(removed.active).toBe(false);
  expect(observer.observe).toHaveBeenCalledTimes(3);
  expect(observer.observe).toHaveBeenLastCalledWith(added);
  observer.emit(removed, true); // A queued entry can arrive after unobserve.
  expect(removed.active).toBe(false);
  observer.emit(added, true);
  expect(added.active).toBe(true);
  MutationObserverStub.instances[0].notify();
  expect(observer.observe).toHaveBeenCalledTimes(3);
});
it('waits for a catalog boundary to hydrate before changing its card attributes', () => {
  cards[0].pending = true;
  useCardMotion();
  const observer = Observer.instances[0];
  expect(observer.observe).toHaveBeenCalledTimes(1);
  expect(observer.observe).toHaveBeenCalledWith(cards[1]);
  observer.emit(cards[0], true);
  expect(cards[0].active).toBe(false);
  expect(MutationObserverStub.instances[0].observe).toHaveBeenCalledWith(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-card-motion-pending'],
  });

  cards[0].pending = false;
  MutationObserverStub.instances[0].notify();
  expect(observer.observe).toHaveBeenCalledTimes(2);
  expect(observer.observe).toHaveBeenLastCalledWith(cards[0]);
  observer.emit(cards[0], true);
  expect(cards[0].active).toBe(true);

  cards[0].pending = true;
  MutationObserverStub.instances[0].notify();
  observer.emit(cards[0], true);
  expect(cards[0].active).toBe(false);
});
it('rebuilds once per frame on resize and ignores callbacks from the old observer', () => {
  useCardMotion();
  const previous = Observer.instances[0];
  browser.innerHeight = 600;
  browser.dispatchEvent(new Event('resize'));
  browser.dispatchEvent(new Event('resize'));
  expect(frames.size).toBe(1);
  flush();
  expect(previous.disconnect).toHaveBeenCalledOnce();
  expect(Observer.instances[1].options.rootMargin).toBe('-299px 0px -299px 0px');
  previous.emit(cards[0], true);
  expect(cards[0].active).toBe(false);
});
it('honors reduced motion and desktop changes, and resumes when eligible again', () => {
  reduced.matches = true;
  useCardMotion();
  expect(Observer.instances).toHaveLength(0);
  reduced.set(false);
  flush();
  Observer.instances[0].emit(cards[0], true);
  reduced.set(true);
  flush();
  expect(cards[0].active).toBe(false);
  reduced.set(false);
  mobile.set(false);
  flush();
  expect(Observer.instances).toHaveLength(1);
  mobile.set(true);
  flush();
  expect(Observer.instances).toHaveLength(2);
});
it('unmount clears active cards and cancels pending work and event listeners', () => {
  useCardMotion();
  const observer = Observer.instances[0];
  observer.emit(cards[0], true);
  browser.dispatchEvent(new Event('resize'));
  lifecycle.cleanup();
  expect(MutationObserverStub.instances[0].disconnect).toHaveBeenCalledOnce();
  observer.emit(cards[0], true);
  expect(cards[0].active).toBe(false);
  expect(frames.size).toBe(0);
  mobile.set(false);
  reduced.set(true);
  browser.dispatchEvent(new Event('resize'));
  expect(frames.size).toBe(0);
});
