import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attachImageGallerySwipe } from '../src/components/molecules/ImageGalleryDialog/swipe';

class ImageSurface extends EventTarget {
  ownerDocument = { defaultView: new EventTarget() };
  clientWidth = 390;
  capturedPointers = new Set<number>();

  getBoundingClientRect() {
    return { width: this.clientWidth, height: 500, left: 0, top: 0 };
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

let surface: ImageSurface;
let cleanup: VoidFunction | undefined;
const navigate = vi.fn();

function pointer(type: string, values: Partial<PointerEvent> = {}) {
  const event = new Event(type, { cancelable: true });
  const properties = {
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    clientX: 250,
    clientY: 200,
    ...values,
  };
  for (const [key, value] of Object.entries(properties)) {
    Object.defineProperty(event, key, { value });
  }
  surface.dispatchEvent(event);
  return event;
}

function swipe(clientX: number, values: Partial<PointerEvent> = {}) {
  pointer('pointerdown', values);
  pointer('pointermove', { ...values, clientX });
  pointer('pointerup', { ...values, clientX });
}

beforeEach(() => {
  navigate.mockClear();
  surface = new ImageSurface();
  cleanup = attachImageGallerySwipe(surface as unknown as HTMLElement, navigate);
});

afterEach(() => cleanup?.());

describe('image popup swipe navigation', () => {
  it.each(['touch', 'pen', 'mouse'])(
    'supports deliberate %s gestures in both directions',
    (pointerType) => {
      swipe(100, { pointerType });
      swipe(400, { pointerType });
      expect(navigate.mock.calls).toEqual([[1], [-1]]);
    },
  );

  it('navigates once on release, never repeatedly while dragging', () => {
    pointer('pointerdown');
    pointer('pointermove', { clientX: 180 });
    pointer('pointermove', { clientX: 100 });
    pointer('pointermove', { clientX: 0 });
    expect(navigate).not.toHaveBeenCalled();
    pointer('pointerup', { clientX: 0 });
    pointer('pointerup', { clientX: 0 });
    expect(navigate.mock.calls).toEqual([[1]]);
  });

  it('does not treat a tap or short finger movement as a swipe', () => {
    swipe(250);
    swipe(245);
    swipe(207);
    expect(navigate).not.toHaveBeenCalled();
    swipe(205);
    expect(navigate.mock.calls).toEqual([[1]]);
  });

  it('scales the swipe distance with a wide desktop image', () => {
    surface.clientWidth = 1200;
    swipe(155);
    expect(navigate).not.toHaveBeenCalled();
    swipe(153);
    expect(navigate.mock.calls).toEqual([[1]]);
  });

  it.each([
    { clientX: 240, clientY: 350 },
    { clientX: 150, clientY: 300 },
    { clientX: 150, clientY: 270 },
  ])('ignores vertical or ambiguous diagonal gestures: %j', (end) => {
    pointer('pointerdown');
    pointer('pointermove', end);
    pointer('pointerup', end);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('accepts a horizontal swipe with small natural vertical drift', () => {
    pointer('pointerdown');
    pointer('pointermove', { clientX: 150, clientY: 230 });
    pointer('pointerup', { clientX: 150, clientY: 230 });
    expect(navigate.mock.calls).toEqual([[1]]);
  });

  it('does not navigate when a vertical scroll later bends horizontally', () => {
    pointer('pointerdown');
    pointer('pointermove', { clientX: 247, clientY: 225 });
    pointer('pointermove', { clientX: 100, clientY: 225 });
    pointer('pointerup', { clientX: 100, clientY: 225 });
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each([1, 2])('ignores mouse button %i', (button) => {
    swipe(100, { pointerType: 'mouse', button });
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true }])(
    'preserves modified pointer gestures: %j',
    (modifier) => {
      swipe(100, { pointerType: 'mouse', ...modifier });
      expect(navigate).not.toHaveBeenCalled();
      expect(surface.capturedPointers.size).toBe(0);
    },
  );

  it.each(['pointercancel', 'lostpointercapture'])(
    'invalidates a gesture on %s and accepts the next complete gesture',
    (cancellation) => {
      pointer('pointerdown');
      pointer('pointermove', { clientX: 100 });
      pointer(cancellation, { clientX: 100 });
      pointer('pointerup', { clientX: 100 });
      expect(navigate).not.toHaveBeenCalled();
      swipe(100);
      expect(navigate.mock.calls).toEqual([[1]]);
    },
  );

  it('does not turn a two-finger gesture into a swipe when one finger lifts', () => {
    pointer('pointerdown');
    pointer('pointerdown', { pointerId: 2, isPrimary: false, clientX: 280 });
    pointer('pointerup', { pointerId: 2, isPrimary: false, clientX: 320 });
    pointer('pointermove', { clientX: 100 });
    pointer('pointerup', { clientX: 100 });
    expect(navigate).not.toHaveBeenCalled();
    swipe(400);
    expect(navigate.mock.calls).toEqual([[-1]]);
  });

  it('stays canceled until every finger from the multi-touch gesture is released', () => {
    pointer('pointerdown');
    pointer('pointerdown', { pointerId: 2, isPrimary: false });
    pointer('pointerup', { clientX: 100 });
    pointer('pointerdown', { pointerId: 3 });
    pointer('pointerup', { pointerId: 2, isPrimary: false });
    pointer('pointermove', { pointerId: 3, clientX: 100 });
    pointer('pointerup', { pointerId: 3, clientX: 100 });
    expect(navigate).not.toHaveBeenCalled();
    swipe(100);
    expect(navigate.mock.calls).toEqual([[1]]);
  });

  it('ignores movement and release from an unrelated pointer', () => {
    pointer('pointerdown');
    pointer('pointermove', { pointerId: 7, clientX: 100 });
    pointer('pointerup', { pointerId: 7, clientX: 100 });
    expect(navigate).not.toHaveBeenCalled();
    pointer('pointermove', { clientX: 100 });
    pointer('pointerup', { clientX: 100 });
    expect(navigate.mock.calls).toEqual([[1]]);
  });

  it('cleans up an unfinished gesture without leaking navigation into the next popup', () => {
    pointer('pointerdown');
    pointer('pointermove', { clientX: 100 });
    cleanup?.();
    expect(surface.capturedPointers.size).toBe(0);
    pointer('pointerup', { clientX: 100 });
    swipe(100);
    expect(navigate).not.toHaveBeenCalled();
    cleanup = attachImageGallerySwipe(surface as unknown as HTMLElement, navigate);
    swipe(100);
    expect(navigate.mock.calls).toEqual([[1]]);
  });
});
