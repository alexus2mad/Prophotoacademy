import { describe, expect, it } from 'vitest';
import {
  horizontalScrollFocus,
  selectScrollCard,
  visibleCardBounds,
} from '../../src/components/behaviors/CardMotion/selection';

describe('single-card scroll selection', () => {
  const viewport = { width: 390, height: 844 };
  const first = { left: 0, right: 170, top: 320, bottom: 520 };
  const second = { left: 172, right: 342, top: 320, bottom: 520 };

  it('selects one card in a row using both axes', () => {
    expect(selectScrollCard([first, second], viewport, -1)).toBe(1);
  });

  it('ignores photographs mostly clipped by a horizontal rail', () => {
    const rail = {
      bounds: { left: 20, right: 370, top: 300, bottom: 550 },
      horizontal: true,
      vertical: true,
    };
    expect(visibleCardBounds({ ...first, left: 350, right: 520 }, [rail], viewport)).toBeNull();
    expect(visibleCardBounds(first, [rail], viewport)).toEqual({ ...first, left: 20 });
  });

  it('hands off after horizontal scrolling and when the selected row leaves view', () => {
    expect(
      selectScrollCard(
        [
          { ...first, left: -120, right: 50 },
          { ...second, left: 52, right: 222 },
        ],
        viewport,
        0,
      ),
    ).toBe(1);
    expect(selectScrollCard([null, second], viewport, 0)).toBe(1);
    expect(selectScrollCard([null, null], viewport, 1)).toBe(-1);
  });

  it('does not alternate between equally close cards on tiny scroll changes', () => {
    const left = { ...first, left: 0, right: 194 };
    const right = { ...second, left: 196, right: 390 };
    expect(selectScrollCard([left, right], viewport, 1)).toBe(1);
    expect(selectScrollCard([{ ...left, left: 1, right: 195 }, right], viewport, 1)).toBe(1);
    expect(selectScrollCard([{ ...left, left: 30, right: 224 }, right], viewport, 1)).toBe(0);
  });

  it('reaches every column in the observed short mobile rail', () => {
    const actualViewport = { width: 375, height: 844 };
    for (const [scroll, expected] of [
      [0, 0],
      [62, 1],
      [124, 2],
    ]) {
      const focus = horizontalScrollFocus(0, 375, 165, scroll, 124);
      const cards = [0, 167, 334].map((left) =>
        visibleCardBounds(
          { left: left - scroll, right: left + 165 - scroll, top: 320, bottom: 520 },
          [],
          actualViewport,
        ),
      );
      expect(
        selectScrollCard(
          cards,
          actualViewport,
          -1,
          cards.map(() => focus),
        ),
      ).toBe(expected);
    }
  });

  it('keeps the horizontal focal point inside nested clipping and clamps overscroll', () => {
    expect(horizontalScrollFocus(20, 355, 165, -10, 124)).toBe(102.5);
    expect(horizontalScrollFocus(20, 355, 165, 200, 124)).toBe(272.5);
    expect(horizontalScrollFocus(20, 100, 165, 62, 124)).toBe(60);
  });
});
