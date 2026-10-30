import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { EffectCallback } from 'react';
import { usePhotographyMotion } from '../../src/components/behaviors/PhotographyMotion/hooks';

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

class Frame extends EventTarget {
  themed = false;
  cardOwned = false;
  pending = false;
  isConnected = true;
  dataset: DOMStringMap = {};
  image = {
    classList: { add: vi.fn(), remove: vi.fn() },
    style: { objectFit: 'cover', setProperty: vi.fn(), removeProperty: vi.fn() },
  };
  closest(selector: string) {
    return (selector.includes('.academy-theme') && this.themed) ||
      (selector.includes('[data-card-photo]') && this.cardOwned) ||
      (selector.includes('[data-card-motion-pending]') && this.pending)
      ? this
      : null;
  }
  querySelector() {
    return this.image;
  }
}
class Observer {
  static instances: Observer[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor() {
    Observer.instances.push(this);
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

let frame: Frame;
beforeEach(() => {
  frame = new Frame();
  Observer.instances = [];
  MutationObserverStub.instances = [];
  const preference = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal(
    'window',
    Object.assign(new EventTarget(), {
      IntersectionObserver: Observer,
      matchMedia: () => preference,
    }),
  );
  vi.stubGlobal(
    'document',
    Object.assign(new EventTarget(), {
      hidden: false,
      querySelectorAll: () => [frame],
      querySelector: () => ({}),
    }),
  );
  vi.stubGlobal('IntersectionObserver', Observer);
  vi.stubGlobal('MutationObserver', MutationObserverStub);
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 1),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => {
  lifecycle.cleanup();
  vi.unstubAllGlobals();
});

it('leaves card-owned photos untouched even outside the streamed Academy shell', () => {
  frame.cardOwned = true;
  usePhotographyMotion();
  expect(Observer.instances[0].observe).not.toHaveBeenCalled();
  expect(frame.dataset).toEqual({});
  expect(frame.image.classList.add).not.toHaveBeenCalled();
});

it('does not mutate a pending fragment before it joins its Academy shell', () => {
  frame.pending = true;
  usePhotographyMotion();
  expect(frame.dataset).toEqual({});
  expect(frame.image.classList.add).not.toHaveBeenCalled();

  frame.pending = false;
  frame.themed = true;
  MutationObserverStub.instances[0].notify();
  expect(Observer.instances[0].observe).not.toHaveBeenCalled();
  expect(frame.dataset).toEqual({});
  expect(frame.image.classList.add).not.toHaveBeenCalled();
});

it('preserves motion initialization and cleanup for ordinary Hub photography', () => {
  usePhotographyMotion();
  expect(Observer.instances[0].observe).toHaveBeenCalledWith(frame);
  expect(frame.dataset.photoMotion).toBe('');
  expect(frame.image.classList.add).toHaveBeenCalledWith('motion-photo');
  lifecycle.cleanup();
  expect(frame.dataset).toEqual({});
  expect(frame.image.classList.remove).toHaveBeenCalledWith('motion-photo');
  expect(Observer.instances[0].disconnect).toHaveBeenCalled();
});
