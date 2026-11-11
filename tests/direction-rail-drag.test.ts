import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { enableHorizontalRailDrag } from '../src/components/behaviors/HorizontalRail/drag';

class RailStub extends EventTarget {
  ownerDocument = { defaultView: new EventTarget() };
  clientWidth = 390;
  scrollWidth = 520;
  scrollLeft = 0;
  attributes = new Set<string>();
  capturedPointers = new Set<number>();

  override removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ) {
    // Node's EventTarget mishandles the boolean capture form when removing listeners.
    super.removeEventListener(
      type,
      callback,
      typeof options === 'boolean' ? { capture: options } : options,
    );
  }

  setAttribute(name: string) {
    this.attributes.add(name);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  setPointerCapture(pointerId: number) {
    this.capturedPointers.add(pointerId);
  }
  hasPointerCapture(pointerId: number) {
    return this.capturedPointers.has(pointerId);
  }
  releasePointerCapture(pointerId: number) {
    this.capturedPointers.delete(pointerId);
  }
}

let rail: RailStub;
let cleanup: VoidFunction | undefined;

function pointer(target: EventTarget, type: string, values: Partial<PointerEvent> = {}) {
  const event = Object.assign(new Event(type, { cancelable: true }), {
    pointerId: 1,
    pointerType: 'mouse',
    button: 0,
    clientX: 250,
    clientY: 200,
    ...values,
  });
  target.dispatchEvent(event);
  return event;
}

function click(detail = 1) {
  const event = Object.assign(new Event('click', { cancelable: true }), { detail });
  rail.dispatchEvent(event);
  return event;
}

function drag(clientX = 150) {
  pointer(rail, 'pointerdown');
  return pointer(rail.ownerDocument.defaultView, 'pointermove', { clientX });
}

beforeEach(() => {
  rail = new RailStub();
  cleanup = enableHorizontalRailDrag(rail as unknown as HTMLElement);
});

afterEach(() => cleanup?.());

describe('direction rail mouse dragging', () => {
  it('scrolls in both directions, bounds the range and suppresses the release click', () => {
    const move = drag();
    expect(rail.scrollLeft).toBe(100);
    expect(move.defaultPrevented).toBe(true);
    expect(rail.hasPointerCapture(1)).toBe(true);
    expect(rail.attributes.has('data-dragging')).toBe(true);

    pointer(rail.ownerDocument.defaultView, 'pointermove', { clientX: -500 });
    expect(rail.scrollLeft).toBe(130);
    pointer(rail.ownerDocument.defaultView, 'pointermove', { clientX: 800 });
    expect(rail.scrollLeft).toBe(0);
    pointer(rail.ownerDocument.defaultView, 'pointerup');

    expect(rail.hasPointerCapture(1)).toBe(false);
    expect(rail.attributes.has('data-dragging')).toBe(false);
    expect(click().defaultPrevented).toBe(true);
  });

  it('preserves ordinary clicks and movement below the drag threshold', () => {
    const down = pointer(rail, 'pointerdown');
    const move = pointer(rail.ownerDocument.defaultView, 'pointermove', {
      clientX: 246,
      clientY: 202,
    });
    pointer(rail.ownerDocument.defaultView, 'pointerup');
    expect(down.defaultPrevented).toBe(false);
    expect(move.defaultPrevented).toBe(false);
    expect(rail.scrollLeft).toBe(0);
    expect(rail.hasPointerCapture(1)).toBe(false);
    expect(click().defaultPrevented).toBe(false);
  });

  it('allows the next ordinary click even if a previous drag did not emit a click', () => {
    drag();
    pointer(rail.ownerDocument.defaultView, 'pointerup');
    pointer(rail, 'pointerdown');
    pointer(rail.ownerDocument.defaultView, 'pointerup');
    expect(click().defaultPrevented).toBe(false);
  });

  it('allows keyboard activation after a drag', () => {
    drag();
    pointer(rail.ownerDocument.defaultView, 'pointerup');
    expect(click(0).defaultPrevented).toBe(false);
  });

  it.each(['touch', 'pen'])('leaves native %s gestures untouched', (pointerType) => {
    pointer(rail, 'pointerdown', { pointerType });
    const move = pointer(rail.ownerDocument.defaultView, 'pointermove', {
      pointerType,
      clientX: 100,
    });
    expect(move.defaultPrevented).toBe(false);
    expect(rail.scrollLeft).toBe(0);
    expect(rail.hasPointerCapture(1)).toBe(false);
    expect(click().defaultPrevented).toBe(false);
  });

  it('abandons a predominantly vertical gesture without blocking native page scrolling', () => {
    pointer(rail, 'pointerdown');
    const move = pointer(rail.ownerDocument.defaultView, 'pointermove', {
      clientX: 245,
      clientY: 220,
    });
    pointer(rail.ownerDocument.defaultView, 'pointermove', { clientX: 100 });
    expect(move.defaultPrevented).toBe(false);
    expect(rail.scrollLeft).toBe(0);
    expect(rail.hasPointerCapture(1)).toBe(false);
    expect(click().defaultPrevented).toBe(false);
  });

  it('does not intercept a desktop grid without horizontal overflow', () => {
    rail.scrollWidth = rail.clientWidth;
    const move = drag();
    expect(move.defaultPrevented).toBe(false);
    expect(rail.scrollLeft).toBe(0);
    expect(click().defaultPrevented).toBe(false);
  });

  it.each([{ button: 1 }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }])(
    'preserves modified or nonprimary clicks: %j',
    (values) => {
      pointer(rail, 'pointerdown', values);
      const move = pointer(rail.ownerDocument.defaultView, 'pointermove', { clientX: 100 });
      expect(move.defaultPrevented).toBe(false);
      expect(rail.scrollLeft).toBe(0);
      expect(click().defaultPrevented).toBe(false);
    },
  );

  it('prevents anchor ghost dragging only while a mouse gesture is pending', () => {
    const idleDrag = new Event('dragstart', { cancelable: true });
    rail.dispatchEvent(idleDrag);
    expect(idleDrag.defaultPrevented).toBe(false);
    pointer(rail, 'pointerdown');
    const nativeDrag = new Event('dragstart', { cancelable: true });
    rail.dispatchEvent(nativeDrag);
    expect(nativeDrag.defaultPrevented).toBe(true);
  });

  it.each(['pointercancel', 'lostpointercapture', 'blur'])(
    'releases the active gesture on %s',
    (eventName) => {
      drag();
      const target = eventName === 'lostpointercapture' ? rail : rail.ownerDocument.defaultView;
      pointer(target, eventName);
      expect(rail.hasPointerCapture(1)).toBe(false);
      expect(rail.attributes.has('data-dragging')).toBe(false);
      pointer(rail.ownerDocument.defaultView, 'pointermove', { clientX: 0 });
      expect(rail.scrollLeft).toBe(100);
    },
  );

  it('ignores events from a different pointer', () => {
    drag();
    pointer(rail.ownerDocument.defaultView, 'pointerup', { pointerId: 2 });
    pointer(rail.ownerDocument.defaultView, 'pointermove', { pointerId: 2, clientX: 0 });
    expect(rail.hasPointerCapture(1)).toBe(true);
    expect(rail.scrollLeft).toBe(100);
  });

  it('releases capture and removes listeners on cleanup', () => {
    drag();
    cleanup?.();
    expect(rail.hasPointerCapture(1)).toBe(false);
    expect(rail.attributes.has('data-dragging')).toBe(false);
    pointer(rail, 'pointerdown');
    pointer(rail.ownerDocument.defaultView, 'pointermove', { clientX: 0 });
    expect(rail.scrollLeft).toBe(100);
    expect(click().defaultPrevented).toBe(false);
    cleanup = undefined;
  });
});
