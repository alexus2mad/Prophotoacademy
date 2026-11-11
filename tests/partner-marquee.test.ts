import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enablePartnerMarquee } from '../src/components/organisms/StudioHomeProof/marquee';

class Preference extends EventTarget {
  matches = false;
  set(value: boolean) {
    this.matches = value;
    this.dispatchEvent(new Event('change'));
  }
}
class VisibilityObserver {
  static current: VisibilityObserver;
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(public notify: IntersectionObserverCallback) {
    VisibilityObserver.current = this;
  }
  show(value: boolean) {
    this.notify(
      [{ isIntersecting: value } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}
class SizeObserver {
  static current: SizeObserver;
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(public notify: VoidFunction) {
    SizeObserver.current = this;
  }
}
const frames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;
const reduced = new Preference();
const browser = Object.assign(new EventTarget(), {
  matchMedia: (query: string) => (query.includes('reduced-motion') ? reduced : { matches: true }),
  requestAnimationFrame: (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  },
  cancelAnimationFrame: (frame: number) => frames.delete(frame),
});
const document = Object.assign(new EventTarget(), {
  defaultView: browser,
  hidden: false,
  activeElement: null,
});
class Rail extends EventTarget {
  ownerDocument = document;
  clientWidth = 390;
  scrollWidth = 1846;
  private attributes = new Map<string, string>();
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  hasAttribute(name: string) {
    return this.attributes.has(name);
  }
  private offset = 0;
  get scrollLeft() {
    return this.offset;
  }
  set scrollLeft(value: number) {
    this.offset = Math.floor(value);
  }
  contains() {
    return false;
  }
  matches() {
    return false;
  }
  focus() {
    this.dispatchEvent(new Event('focusin'));
  }
}
const firstCopy = { getBoundingClientRect: () => ({ width: 923 }) };
let rail: Rail;
let dispose: VoidFunction | undefined;
function tick(time: number) {
  for (const [frame, callback] of [...frames]) {
    frames.delete(frame);
    callback(time);
  }
}
function start() {
  dispose = enablePartnerMarquee(rail as unknown as HTMLElement, firstCopy as HTMLElement);
  VisibilityObserver.current.show(true);
  tick(0);
}
beforeEach(() => {
  frames.clear();
  reduced.matches = false;
  document.hidden = false;
  rail = new Rail();
  vi.stubGlobal('IntersectionObserver', VisibilityObserver);
  vi.stubGlobal('ResizeObserver', SizeObserver);
});
afterEach(() => {
  dispose?.();
  vi.unstubAllGlobals();
});

describe('partner logo native-scroll autoplay', () => {
  it('accumulates subpixel travel rather than freezing on integer scroll positions', () => {
    start();
    for (let time = 16; time <= 160; time += 16) tick(time);
    expect(rail.scrollLeft).toBe(3);
  });

  it('holds touch interaction through inertia and resumes from the manually chosen position', () => {
    start();
    rail.dispatchEvent(new Event('pointerdown'));
    expect(frames.size).toBe(0);
    rail.scrollLeft = 400;
    rail.dispatchEvent(new Event('pointerup'));
    tick(60_000);
    expect(rail.scrollLeft).toBe(400);
    rail.dispatchEvent(new Event('focusout'));
    tick(60_016);
    expect(rail.scrollLeft).toBe(400);
    tick(60_080);
    expect(rail.scrollLeft).toBe(401);
  });

  it('marks pointer focus before pausing so touch does not inherit a keyboard outline', () => {
    start();
    const focusedWithPointer = vi.fn();
    vi.spyOn(rail, 'focus').mockImplementation(() => {
      focusedWithPointer(rail.hasAttribute('data-pointer-focus'));
      rail.dispatchEvent(new Event('focusin'));
    });
    rail.dispatchEvent(Object.assign(new Event('pointerdown'), { pointerType: 'touch' }));
    expect(focusedWithPointer).toHaveBeenCalledWith(true);
    expect(frames.size).toBe(0);
  });

  it('restores keyboard focus styling without resuming autoplay or canceling native keys', () => {
    start();
    rail.dispatchEvent(new Event('pointerdown'));
    const key = Object.assign(new Event('keydown', { cancelable: true }), { key: 'ArrowRight' });
    rail.dispatchEvent(key);
    expect(rail.hasAttribute('data-pointer-focus')).toBe(false);
    expect(key.defaultPrevented).toBe(false);
    expect(frames.size).toBe(0);
  });

  it('clears pointer focus styling when focus leaves or the marquee is removed', () => {
    start();
    rail.dispatchEvent(new Event('pointerdown'));
    rail.dispatchEvent(new Event('focusout'));
    expect(rail.hasAttribute('data-pointer-focus')).toBe(false);
    rail.dispatchEvent(new Event('pointerdown'));
    dispose?.();
    expect(rail.hasAttribute('data-pointer-focus')).toBe(false);
  });

  it('wraps at the identical copy without exposing an empty track', () => {
    rail.scrollLeft = 922;
    start();
    tick(64);
    expect(rail.scrollLeft).toBe(0);
    tick(128);
    expect(rail.scrollLeft).toBe(1);
  });

  it('pauses on hover and resumes after leaving without counting paused time', () => {
    start();
    rail.dispatchEvent(Object.assign(new Event('pointerenter'), { pointerType: 'mouse' }));
    expect(frames.size).toBe(0);
    rail.dispatchEvent(Object.assign(new Event('pointerleave'), { pointerType: 'mouse' }));
    tick(80_000);
    expect(rail.scrollLeft).toBe(0);
    tick(80_064);
    expect(rail.scrollLeft).toBe(1);
  });

  it('leaves native horizontal wheel scrolling paused without canceling the event', () => {
    start();
    const wheel = Object.assign(new Event('wheel', { cancelable: true }), { deltaX: 30 });
    rail.dispatchEvent(wheel);
    expect(frames.size).toBe(0);
    expect(wheel.defaultPrevented).toBe(false);
  });

  it('does not interrupt vertical page wheel scrolling', () => {
    start();
    const wheel = Object.assign(new Event('wheel', { cancelable: true }), {
      deltaX: 0,
      deltaY: 30,
    });
    rail.dispatchEvent(wheel);
    expect(frames.size).toBe(1);
    expect(wheel.defaultPrevented).toBe(false);
  });

  it('respects reduced motion, page visibility and offscreen suspension', () => {
    start();
    reduced.set(true);
    expect(frames.size).toBe(0);
    reduced.set(false);
    expect(frames.size).toBe(1);
    document.hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(frames.size).toBe(0);
    document.hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(frames.size).toBe(1);
    VisibilityObserver.current.show(false);
    expect(frames.size).toBe(0);
    VisibilityObserver.current.show(true);
    tick(100_000);
    expect(rail.scrollLeft).toBe(0);
  });

  it('stays still when all logos already fit in a wide viewport', () => {
    rail.clientWidth = 1500;
    start();
    expect(frames.size).toBe(0);
  });

  it('removes listeners and cancels animation when disposed', () => {
    start();
    dispose?.();
    expect(frames.size).toBe(0);
    reduced.set(true);
    reduced.set(false);
    rail.dispatchEvent(new Event('focusout'));
    // Observer delivery may already be queued when cleanup disconnects it.
    VisibilityObserver.current.show(true);
    SizeObserver.current.notify();
    expect(frames.size).toBe(0);
    expect(VisibilityObserver.current.disconnect).toHaveBeenCalledOnce();
    expect(SizeObserver.current.disconnect).toHaveBeenCalledOnce();
    dispose = undefined;
  });
});
