import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { DependencyList, EffectCallback } from 'react';
import type { LessonBlockProps } from '../../src/lib/learning/types';
import type { HookEffect, ImageObserverCallback, PendingEffect } from './types';
import { useLessonMaterial } from '../../src/components/organisms/LessonMaterial/hooks';

const lifecycle = vi.hoisted(() => ({
  stateIndex: 0,
  effectIndex: 0,
  states: [] as unknown[],
  effects: [] as HookEffect[],
  pending: [] as PendingEffect[],
  container: { current: {} as HTMLDivElement },
}));
vi.mock('react', () => ({
  useRef: () => lifecycle.container,
  useState(initial: unknown) {
    const index = lifecycle.stateIndex++;
    if (!(index in lifecycle.states)) lifecycle.states[index] = initial;
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
    if (
      previous &&
      dependencies.length === previous.dependencies.length &&
      dependencies.every((value, i) => Object.is(value, previous.dependencies[i]))
    )
      return;
    lifecycle.pending.push({ index, callback, dependencies });
  },
}));

class Observer {
  static instances: Observer[] = [];
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(
    readonly notify: ImageObserverCallback,
    readonly options: IntersectionObserverInit,
  ) {
    Observer.instances.push(this);
  }
  emit(isIntersecting: boolean) {
    this.notify([{ isIntersecting }]);
  }
}

const props: LessonBlockProps = {
  block: {
    id: 'photo',
    mediaId: 'private-photo',
    kind: 'image',
    title: '',
    required: false,
    revision: 1,
  },
  courseId: 'course',
  lessonId: 'lesson',
  onProgress: vi.fn(),
};
const request = vi.fn<typeof fetch>(() => new Promise<Response>(() => {}));
const frames = new Map<number, FrameRequestCallback>();
let browser = Object.assign(new EventTarget(), { innerHeight: 844 });

// Commit effects after rendering, retaining state and dependency cleanup between renders.
const render = (input = props) => {
  lifecycle.stateIndex = 0;
  lifecycle.effectIndex = 0;
  const result = useLessonMaterial(input);
  for (const { index, callback, dependencies } of lifecycle.pending.splice(0)) {
    lifecycle.effects[index]?.cleanup?.();
    lifecycle.effects[index] = { dependencies, cleanup: callback() };
  }
  return result;
};
const unmount = () => {
  for (const effect of lifecycle.effects.splice(0)) effect.cleanup?.();
};
const flushFrames = () => {
  for (const [id, callback] of [...frames]) {
    frames.delete(id);
    callback(0);
  }
};

beforeEach(() => {
  lifecycle.states = [];
  lifecycle.effects = [];
  lifecycle.pending = [];
  Observer.instances = [];
  request.mockClear();
  vi.mocked(props.onProgress).mockClear();
  frames.clear();
  browser = Object.assign(new EventTarget(), { innerHeight: 844 });
  vi.stubGlobal('window', Object.assign(browser, { IntersectionObserver: Observer }));
  vi.stubGlobal('IntersectionObserver', Observer);
  vi.stubGlobal('fetch', request);
  let nextFrame = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});
afterEach(() => {
  unmount();
  vi.unstubAllGlobals();
});

it('waits for the three-viewport buffer, then authorizes an image only once', () => {
  render();
  const observer = Observer.instances[0];
  expect(observer.options.rootMargin).toBe('2532px 0px');
  expect(observer.observe).toHaveBeenCalledWith(lifecycle.container.current);
  expect(request).not.toHaveBeenCalled();
  observer.emit(false);
  render();
  expect(request).not.toHaveBeenCalled();

  observer.emit(true);
  render();
  expect(request).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledWith(
    '/api/learning/course/lesson/media/private-photo',
    expect.objectContaining({ cache: 'no-store', signal: expect.any(AbortSignal) }),
  );
  expect(observer.disconnect).toHaveBeenCalledOnce();
  observer.emit(false);
  observer.emit(true);
  browser.dispatchEvent(new Event('resize'));
  render();
  expect(request).toHaveBeenCalledTimes(1);
  expect(frames.size).toBe(0);
  expect(Observer.instances).toHaveLength(1);
  expect(props.onProgress).not.toHaveBeenCalled();
});

it('recalculates pending distance once per resize frame and ignores the old observer', () => {
  render();
  const previous = Observer.instances[0];
  browser.innerHeight = 600;
  browser.dispatchEvent(new Event('resize'));
  browser.dispatchEvent(new Event('resize'));
  expect(frames.size).toBe(1);
  flushFrames();
  expect(previous.disconnect).toHaveBeenCalledOnce();
  expect(Observer.instances).toHaveLength(2);
  const current = Observer.instances[1];
  expect(current.options.rootMargin).toBe('1800px 0px');
  expect(current.observe).toHaveBeenCalledWith(lifecycle.container.current);
  previous.emit(true);
  render();
  expect(request).not.toHaveBeenCalled();
  current.emit(true);
  render();
  expect(request).toHaveBeenCalledTimes(1);
});

it('cancels queued resize work immediately when an image enters the buffer', () => {
  render();
  browser.dispatchEvent(new Event('resize'));
  expect(frames.size).toBe(1);
  Observer.instances[0].emit(true);
  expect(frames.size).toBe(0);
  browser.dispatchEvent(new Event('resize'));
  flushFrames();
  render();
  expect(Observer.instances).toHaveLength(1);
  expect(request).toHaveBeenCalledTimes(1);
});

it('removes pending observers and resize work on unmount without authorizing an image', () => {
  render();
  const observer = Observer.instances[0];
  browser.dispatchEvent(new Event('resize'));
  unmount();
  expect(observer.disconnect).toHaveBeenCalledOnce();
  expect(frames.size).toBe(0);
  observer.emit(true);
  browser.dispatchEvent(new Event('resize'));
  flushFrames();
  expect(lifecycle.states[0]).toBe(false);
  expect(request).not.toHaveBeenCalled();
  expect(Observer.instances).toHaveLength(1);
});

it('keeps images accessible when IntersectionObserver is unavailable', () => {
  vi.stubGlobal('window', browser);
  Reflect.deleteProperty(browser, 'IntersectionObserver');
  vi.stubGlobal('IntersectionObserver', undefined);
  render();
  render();
  expect(Observer.instances).toHaveLength(0);
  expect(request).toHaveBeenCalledTimes(1);
  expect(props.onProgress).not.toHaveBeenCalled();
});

it('preserves immediate authorization for non-image media', () => {
  render({ ...props, block: { ...props.block, kind: 'video' } });
  expect(request).toHaveBeenCalledTimes(1);
  expect(Observer.instances).toHaveLength(0);
});

it('aborts image authorization if the material unmounts during the request', () => {
  render();
  Observer.instances[0].emit(true);
  render();
  const signal = request.mock.calls[0][1]?.signal;
  expect(signal?.aborted).toBe(false);
  unmount();
  expect(signal?.aborted).toBe(true);
});
