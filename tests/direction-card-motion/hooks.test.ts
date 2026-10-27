import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { EffectCallback } from 'react';
import type { MotionCard, MotionObserverCallback } from './types';
import { useDirectionCardMotion } from '../../src/components/behaviors/DirectionCardMotion/hooks';

const lifecycle = vi.hoisted(() => ({ cleanup: vi.fn() }));
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
let cards: Card[], mobile: Preference, reduced: Preference;
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
  vi.stubGlobal('document', { querySelectorAll: () => cards });
  vi.stubGlobal('IntersectionObserver', Observer);
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
  expect(() => useDirectionCardMotion()).not.toThrow();
  expect(Observer.instances).toHaveLength(0);
  expect(cards.every((card) => !card.active)).toBe(true);
});
it('activates cards at the viewport-height center line and clears them on exit', () => {
  useDirectionCardMotion();
  const observer = Observer.instances[0];
  expect(observer.options.rootMargin).toBe('-421px 0px -421px 0px');
  expect(observer.observe).toHaveBeenCalledTimes(2);
  observer.emit(cards[0], true);
  observer.emit(cards[1], true);
  expect(cards.every((card) => card.active)).toBe(true); // A tablet row can share the center.
  observer.emit(cards[0], false);
  expect(cards.map((card) => card.active)).toEqual([false, true]);
});
it('rebuilds once per frame on resize and ignores callbacks from the old observer', () => {
  useDirectionCardMotion();
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
  useDirectionCardMotion();
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
  useDirectionCardMotion();
  const observer = Observer.instances[0];
  observer.emit(cards[0], true);
  browser.dispatchEvent(new Event('resize'));
  lifecycle.cleanup();
  observer.emit(cards[0], true);
  expect(cards[0].active).toBe(false);
  expect(frames.size).toBe(0);
  mobile.set(false);
  reduced.set(true);
  browser.dispatchEvent(new Event('resize'));
  expect(frames.size).toBe(0);
});
