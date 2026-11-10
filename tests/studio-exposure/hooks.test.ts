import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { DependencyList, EffectCallback } from 'react';
import type { StudioHomeMode } from '../../src/lib/studio-home/types';
import type { ExposureEffect, PendingExposureEffect } from './types';
import { useStudioHomeExposure } from '../../src/components/organisms/StudioHomeExposure/hooks';

const lifecycle = vi.hoisted(() => ({
  stateIndex: 0,
  effectIndex: 0,
  states: [] as unknown[],
  effects: [] as ExposureEffect[],
  pending: [] as PendingExposureEffect[],
  section: { current: { getBoundingClientRect: vi.fn(), querySelector: vi.fn() } },
}));
vi.mock('react', () => ({
  useRef: () => lifecycle.section,
  useState(initial: unknown) {
    const index = lifecycle.stateIndex++;
    if (!(index in lifecycle.states))
      lifecycle.states[index] = typeof initial === 'function' ? initial() : initial;
    return [
      lifecycle.states[index],
      (value: unknown) => {
        lifecycle.states[index] =
          typeof value === 'function' ? value(lifecycle.states[index]) : value;
      },
    ];
  },
  useEffect(callback: EffectCallback, dependencies: DependencyList) {
    const index = lifecycle.effectIndex++;
    const previous = lifecycle.effects[index];
    if (previous && dependencies.every((value, i) => Object.is(value, previous.dependencies[i])))
      return;
    lifecycle.pending.push({ index, callback, dependencies });
  },
}));

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
  constructor(readonly notify: VoidFunction) {
    Observer.instances.push(this);
  }
}
let reduced: Preference;
let browser = Object.assign(new EventTarget(), { innerHeight: 900 });
let documentState = Object.assign(new EventTarget(), { hidden: false });
let bounds = { top: 0, height: 1350 };
let stageHeight = 900;
let stickyOffset = 0;
const stage = { getBoundingClientRect: () => ({ height: stageHeight }) };
const frames = new Map<number, FrameRequestCallback>();
const render = (mode: StudioHomeMode = 'academy') => {
  lifecycle.stateIndex = 0;
  lifecycle.effectIndex = 0;
  const result = useStudioHomeExposure(mode);
  for (const { index, callback, dependencies } of lifecycle.pending.splice(0)) {
    lifecycle.effects[index]?.cleanup?.();
    lifecycle.effects[index] = { dependencies, cleanup: callback() };
  }
  return result;
};
const flush = () => {
  for (const [id, callback] of [...frames]) {
    frames.delete(id);
    callback(0);
  }
};
const unmount = () => {
  for (const effect of lifecycle.effects.splice(0)) effect.cleanup?.();
};

beforeEach(() => {
  lifecycle.states = [];
  lifecycle.effects = [];
  lifecycle.pending = [];
  reduced = new Preference();
  browser = Object.assign(new EventTarget(), { innerHeight: 900 });
  documentState = Object.assign(new EventTarget(), { hidden: false });
  bounds = { top: 0, height: 1350 };
  stageHeight = 900;
  stickyOffset = 0;
  lifecycle.section.current.getBoundingClientRect.mockReset().mockImplementation(() => bounds);
  lifecycle.section.current.querySelector.mockReset().mockReturnValue(stage);
  Observer.instances = [];
  frames.clear();
  let nextFrame = 0;
  vi.stubGlobal(
    'window',
    Object.assign(browser, {
      matchMedia: () => reduced,
      getComputedStyle: () => ({ top: `${stickyOffset}px` }),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        frames.set(++nextFrame, callback);
        return nextFrame;
      },
      cancelAnimationFrame: (id: number) => frames.delete(id),
    }),
  );
  vi.stubGlobal('document', documentState);
  vi.stubGlobal('ResizeObserver', Observer);
});
afterEach(() => {
  unmount();
  vi.unstubAllGlobals();
});

it('measures immediately on hydration, including a restored scroll position', () => {
  bounds.top = -180;
  expect(render().ready).toBe(false);
  expect(render().exposure.progress).toBe(0.5);
  expect(render().ready).toBe(true);
  expect(frames.size).toBe(0);
});

it('coalesces scroll work, reverses exposure, and avoids replacing unchanged state', () => {
  render();
  const initial = render().exposure;
  browser.dispatchEvent(new Event('scroll'));
  browser.dispatchEvent(new Event('scroll'));
  expect(frames.size).toBe(1);
  flush();
  expect(render().exposure).toBe(initial);
  bounds.top = -360;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure.progress).toBe(1);
  bounds.top = -180;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure.progress).toBe(0.5);
});

it('cancels queued animation before applying reduced motion and recalculates when restored', () => {
  render();
  bounds.top = -180;
  browser.dispatchEvent(new Event('scroll'));
  reduced.set(true);
  expect(frames.size).toBe(0);
  expect(render().exposure.progress).toBe(1);
  flush();
  expect(render().exposure.progress).toBe(1);
  reduced.set(false);
  expect(render().exposure.progress).toBe(0.5);
});

it('ignores mobile toolbar height changes and recalculates only from the rendered stage geometry', () => {
  bounds = { top: -675.2, height: 2532 };
  stageHeight = 844;
  render();
  const before = render().exposure;
  expect(before.progress).toBe(0.5);
  browser.innerHeight = 744;
  browser.dispatchEvent(new Event('resize'));
  flush();
  expect(render().exposure).toBe(before);
  browser.innerHeight = 844;
  browser.dispatchEvent(new Event('resize'));
  flush();
  expect(render().exposure).toBe(before);
  // A real orientation/layout change updates both the CSS stage and section.
  bounds = { top: -512, height: 1920 };
  stageHeight = 640;
  Observer.instances[0].notify();
  flush();
  expect(render().exposure.progress).toBe(0.5);
  expect(Observer.instances[0].observe).toHaveBeenCalledWith(stage);
});

it('accounts for a fixed safe-area offset without depending on header dimensions', () => {
  stickyOffset = 24;
  bounds.top = 24 - 180;
  render();
  expect(render().exposure.progress).toBe(0.5);
  stickyOffset = 0;
  browser.dispatchEvent(new Event('resize'));
  flush();
  expect(render().exposure.progress).toBeCloseTo(0.433);
});

it('resynchronizes on browser-tab return and back-forward restoration', () => {
  render();
  browser.dispatchEvent(new Event('scroll'));
  documentState.hidden = true;
  documentState.dispatchEvent(new Event('visibilitychange'));
  expect(frames.size).toBe(0);
  bounds.top = -360;
  browser.dispatchEvent(new Event('scroll'));
  expect(frames.size).toBe(0);
  documentState.hidden = false;
  documentState.dispatchEvent(new Event('visibilitychange'));
  expect(render().exposure.progress).toBe(1);
  bounds.top = 0;
  browser.dispatchEvent(new Event('pageshow'));
  expect(render().exposure.progress).toBe(0);
});

it('resynchronizes hero-tab changes without preserving stale measurements', () => {
  render();
  const previous = Observer.instances[0];
  browser.dispatchEvent(new Event('scroll'));
  bounds.top = -180;
  render('studio');
  expect(previous.disconnect).toHaveBeenCalledOnce();
  expect(frames.size).toBe(0);
  expect(render('studio').exposure.progress).toBe(0.5);
});

it('removes listeners and observer work on unmount', () => {
  render();
  const observer = Observer.instances[0];
  browser.dispatchEvent(new Event('scroll'));
  unmount();
  expect(observer.disconnect).toHaveBeenCalledOnce();
  expect(frames.size).toBe(0);
  browser.dispatchEvent(new Event('scroll'));
  reduced.set(true);
  observer.notify();
  expect(frames.size).toBe(0);
});
