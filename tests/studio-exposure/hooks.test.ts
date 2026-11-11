import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { DependencyList, EffectCallback } from 'react';
import type { StudioHomeMode } from '../../src/lib/studio-home/types';
import type { StudioHomeExposureProps } from '../../src/components/organisms/StudioHomeExposure/types';
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
let compactLayout: Preference;
let browser = Object.assign(new EventTarget(), { innerHeight: 900, innerWidth: 1440 });
let documentState = Object.assign(new EventTarget(), { hidden: false });
let bounds = { top: 0, height: 1350 };
let stageHeight = 900;
let stageWidth = 1440;
let stickyOffset = 0;
let now = 0;
const stage = { getBoundingClientRect: vi.fn(() => ({ height: stageHeight, width: stageWidth })) };
const computedStyle = vi.fn(() => ({ top: `${stickyOffset}px` }));
const frames = new Map<number, FrameRequestCallback>();
const render = (
  mode: StudioHomeMode = 'academy',
  directionsRef?: StudioHomeExposureProps['directionsRef'],
) => {
  lifecycle.stateIndex = 0;
  lifecycle.effectIndex = 0;
  const result = useStudioHomeExposure(mode, directionsRef);
  for (const { index, callback, dependencies } of lifecycle.pending.splice(0)) {
    lifecycle.effects[index]?.cleanup?.();
    lifecycle.effects[index] = { dependencies, cleanup: callback() };
  }
  return result;
};
const flush = (elapsedMs = 16) => {
  now += elapsedMs;
  for (const [id, callback] of [...frames]) {
    frames.delete(id);
    callback(now);
  }
};
const settle = () => {
  for (let count = 0; frames.size && count < 100; count++) flush();
  expect(frames.size).toBe(0);
};
const unmount = () => {
  for (const effect of lifecycle.effects.splice(0)) effect.cleanup?.();
};

beforeEach(() => {
  lifecycle.states = [];
  lifecycle.effects = [];
  lifecycle.pending = [];
  reduced = new Preference();
  compactLayout = new Preference();
  browser = Object.assign(new EventTarget(), { innerHeight: 900, innerWidth: 1440 });
  documentState = Object.assign(new EventTarget(), { hidden: false });
  bounds = { top: 0, height: 1350 };
  stageHeight = 900;
  stageWidth = 1440;
  stickyOffset = 0;
  stage.getBoundingClientRect.mockClear();
  computedStyle.mockClear();
  now = 0;
  lifecycle.section.current.getBoundingClientRect
    .mockReset()
    .mockImplementation(() => ({ ...bounds, bottom: bounds.top + bounds.height }));
  lifecycle.section.current.querySelector.mockReset().mockReturnValue(stage);
  Observer.instances = [];
  frames.clear();
  let nextFrame = 0;
  vi.stubGlobal(
    'window',
    Object.assign(browser, {
      matchMedia: (query: string) => (query.includes('max-width') ? compactLayout : reduced),
      getComputedStyle: computedStyle,
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        frames.set(++nextFrame, callback);
        return nextFrame;
      },
      cancelAnimationFrame: (id: number) => frames.delete(id),
    }),
  );
  vi.stubGlobal('document', documentState);
  vi.stubGlobal('ResizeObserver', Observer);
  vi.stubGlobal('performance', { now: () => now });
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

it('coalesces scroll work, eases to exact targets, and stops scheduling when settled', () => {
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
  expect(render().exposure.progress).toBeGreaterThan(0);
  expect(render().exposure.progress).toBeLessThan(1);
  expect(frames.size).toBe(1);
  settle();
  expect(render().exposure.progress).toBe(1);
  bounds.top = -180;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure.progress).toBeGreaterThan(0.5);
  expect(render().exposure.progress).toBeLessThan(1);
  settle();
  expect(render().exposure.progress).toBe(0.5);
  const settled = render().exposure;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure).toBe(settled);
  expect(frames.size).toBe(0);
});

it('reverses toward the latest scroll target without overshooting or restarting the timeline', () => {
  render();
  bounds.top = -360;
  browser.dispatchEvent(new Event('scroll'));
  flush(120);
  const forward = render().exposure.progress;
  expect(forward).toBeGreaterThan(0.5);
  bounds.top = 0;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure.progress).toBeLessThan(forward);
  expect(render().exposure.progress).toBeGreaterThan(0);
  settle();
  expect(render().exposure.progress).toBe(0);
});

it('reads layout only when geometry is dirty, not for every catch-up frame', () => {
  render();
  const measure = lifecycle.section.current.getBoundingClientRect;
  measure.mockClear();
  bounds.top = -360;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(measure).toHaveBeenCalledOnce();
  flush();
  flush();
  expect(measure).toHaveBeenCalledOnce();
  bounds.top = -180;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(measure).toHaveBeenCalledTimes(2);
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

it('keeps the desktop timeline tied to rendered stage geometry rather than viewport height', () => {
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

it('keeps desktop catch-up smooth when the viewport changes without a layout change', () => {
  bounds = { top: 0, height: 2532 };
  stageHeight = 844;
  stageWidth = 390;
  render();
  bounds.top = -675.2;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  const before = render().exposure.progress;
  browser.innerHeight = 744;
  browser.dispatchEvent(new Event('resize'));
  flush();
  expect(render().exposure.progress).toBeGreaterThan(before);
  expect(render().exposure.progress).toBeLessThan(0.5);
  settle();
  expect(render().exposure.progress).toBe(0.5);
});

it('snaps a real layout change while interpolation is pending', () => {
  render();
  bounds.top = -360;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  bounds = { top: -512, height: 1920 };
  stageHeight = 640;
  stageWidth = 844;
  Observer.instances[0].notify();
  flush();
  expect(render().exposure.progress).toBe(0.5);
  expect(frames.size).toBe(0);
});

it('snaps and stops rendering once the scene moves outside the viewport', () => {
  render();
  bounds.top = -180;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(frames.size).toBe(1);
  bounds.top = -1400;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure.progress).toBe(1);
  expect(frames.size).toBe(0);
  bounds.top = 950;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure.progress).toBe(0);
  expect(frames.size).toBe(0);
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
  compactLayout.set(true);
  observer.notify();
  expect(frames.size).toBe(0);
});

it('follows compact scrolling directly in one frame and reverses without catch-up frames', () => {
  compactLayout.set(true);
  browser.innerHeight = 800;
  bounds = { top: 440, height: 280 };
  stageHeight = 280;
  stageWidth = 390;
  render();
  expect(render().compact).toBe(true);
  expect(render().exposure.progress).toBeCloseTo(0);
  expect(render().exposure.value).toBe('0.0 EV');
  bounds.top = 242;
  browser.dispatchEvent(new Event('scroll'));
  browser.dispatchEvent(new Event('scroll'));
  expect(frames.size).toBe(1);
  flush();
  expect(render().exposure).toMatchObject({
    activeBars: 33,
    redBars: 0,
    value: '+1.5 EV',
  });
  expect(render().exposure.progress).toBeCloseTo(0.45);
  expect(frames.size).toBe(0);
  bounds.top = 440;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure.progress).toBeCloseTo(0);
  expect(frames.size).toBe(0);
});

it('keeps compact progress stable during browser chrome resizing and refreshes after restoration', () => {
  compactLayout.set(true);
  browser.innerHeight = 800;
  bounds = { top: 242, height: 280 };
  stageHeight = 280;
  render();
  expect(render().exposure.progress).toBeCloseTo(0.45);
  browser.innerHeight = 700;
  browser.dispatchEvent(new Event('resize'));
  expect(frames.size).toBe(0);
  flush();
  expect(render().exposure.progress).toBeCloseTo(0.45);
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure.progress).toBeCloseTo(0.45);
  bounds.top = 0;
  browser.dispatchEvent(new Event('pageshow'));
  expect(render().exposure.progress).toBeCloseTo(385 / 420);
  expect(frames.size).toBe(0);
});

it('refreshes compact viewport geometry after a real width or orientation change', () => {
  compactLayout.set(true);
  browser.innerWidth = 390;
  browser.innerHeight = 800;
  bounds = { top: 242, height: 280 };
  render();
  expect(render().exposure.progress).toBeCloseTo(0.45);
  browser.innerWidth = 700;
  browser.innerHeight = 390;
  browser.dispatchEvent(new Event('resize'));
  flush();
  expect(render().exposure.progress).toBe(0);
  browser.innerHeight = 700;
  browser.dispatchEvent(new Event('orientationchange'));
  expect(render().exposure.progress).toBeCloseTo((385 - 242) / 420);
});

it('does not read desktop stage geometry or computed styles while compact scrolling', () => {
  compactLayout.set(true);
  browser.innerHeight = 800;
  bounds = { top: 440, height: 280 };
  render();
  bounds.top = 242;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure.progress).toBeCloseTo(0.45);
  expect(stage.getBoundingClientRect).not.toHaveBeenCalled();
  expect(computedStyle).not.toHaveBeenCalled();
});

it('hands compact presentation to the directions element without React progress props', () => {
  compactLayout.set(true);
  browser.innerHeight = 800;
  bounds = { top: 440, height: 280 };
  const attributes = new Map([['data-header-tone', 'light']]);
  const directions = {
    style: { setProperty: vi.fn(), removeProperty: vi.fn() },
    getAttribute: (name: string) => attributes.get(name),
    setAttribute: vi.fn((name: string, value: string) => attributes.set(name, value)),
  };
  const ref = { current: directions as unknown as HTMLElement };
  render('academy', ref);
  expect(directions.style.setProperty.mock.lastCall?.[0]).toBe('--mobile-exposure');
  expect(Number(directions.style.setProperty.mock.lastCall?.[1])).toBeCloseTo(0);
  expect(directions.setAttribute).toHaveBeenCalledWith('data-header-tone', 'dark');
  directions.setAttribute.mockClear();
  bounds.top = 242;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(Number(directions.style.setProperty.mock.lastCall?.[1])).toBeCloseTo(0.45);
  expect(directions.setAttribute).not.toHaveBeenCalled();
  bounds.top = 0;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(directions.setAttribute).toHaveBeenCalledWith('data-header-tone', 'light');
  compactLayout.set(false);
  expect(directions.style.removeProperty).toHaveBeenCalledWith('--mobile-exposure');
  unmount();
  expect(frames.size).toBe(0);
});

it('switches between compact and cinematic timelines without retaining stale progress', () => {
  bounds.top = -180;
  render();
  expect(render().compact).toBe(false);
  expect(render().exposure.progress).toBe(0.5);
  browser.innerHeight = 800;
  bounds = { top: 440, height: 280 };
  stageHeight = 280;
  stageWidth = 390;
  compactLayout.set(true);
  expect(render().compact).toBe(true);
  expect(render().exposure.progress).toBeCloseTo(0);
  expect(render().exposure.value).toBe('0.0 EV');
  bounds = { top: -360, height: 1350 };
  stageHeight = 900;
  stageWidth = 1440;
  compactLayout.set(false);
  expect(render().compact).toBe(false);
  expect(render().exposure).toMatchObject({ progress: 1, redBars: 6, value: '0.0 EV' });
  expect(frames.size).toBe(0);
});

it('uses the artifact static compact states with reduced motion and resumes native progress', () => {
  compactLayout.set(true);
  browser.innerHeight = 800;
  bounds = { top: 242, height: 280 };
  stageHeight = 280;
  render();
  reduced.set(true);
  expect(render().exposure).toMatchObject({ progress: 0, activeBars: 33, redBars: 0 });
  bounds.top = 100;
  browser.dispatchEvent(new Event('scroll'));
  flush();
  expect(render().exposure).toMatchObject({ progress: 1, activeBars: 33, redBars: 33 });
  reduced.set(false);
  expect(render().exposure.progress).toBeCloseTo(340 / 440);
  expect(frames.size).toBe(0);
});
