import { expect, it } from 'vitest';
import {
  exposureTitlePhase,
  exposureWordTranslation,
  canMorphExposureWords,
} from '../../src/components/molecules/StudioExposureTitle/selectors';

it('preserves the complete title through the first half, then removes only the unwanted words', () => {
  for (const progress of [0, 0.25, 0.5]) {
    expect(exposureTitlePhase(progress)).toEqual({ removedOpacity: 1, horizontal: 0, vertical: 0 });
  }
  expect(exposureTitlePhase(0.59).removedOpacity).toBeCloseTo(0.5);
  expect(exposureTitlePhase(0.59).horizontal).toBe(0);
  expect(exposureTitlePhase(0.68)).toEqual({ removedOpacity: 0, horizontal: 0, vertical: 0 });
});

it('retains the readable source when enlarged text wraps the target or shares unsafe source tracks', () => {
  const source = [
    { left: 40, top: 0, width: 160 },
    { left: 204, top: 68, width: 30 },
    { left: 16, top: 102, width: 30 },
    { left: 51, top: 102, width: 30 },
    { left: 86, top: 102, width: 90 },
  ];
  const target = [
    { left: 90, top: 0, width: 160 },
    { left: 62, top: 34, width: 30 },
    { left: 97, top: 34, width: 30 },
    { left: 132, top: 34, width: 30 },
    { left: 167, top: 34, width: 90 },
  ];
  expect(canMorphExposureWords(source, target, 343)).toBe(true);
  expect(
    canMorphExposureWords(
      source,
      target.map((word, i) => (i === 4 ? { ...word, top: 68 } : word)),
      343,
    ),
  ).toBe(false);
  expect(
    canMorphExposureWords(
      source.map((word, i) => (i === 1 ? { ...word, top: 0 } : word)),
      target,
      343,
    ),
  ).toBe(false);
  expect(canMorphExposureWords(source, target, 150)).toBe(false);
  expect(canMorphExposureWords([], target, 343)).toBe(false);
});

it('aligns wrapped words horizontally before closing their line gap, so their paths cannot cross', () => {
  // At 390px the original «як» ends the third line; «ви це робите» starts the fourth.
  const words = [
    { source: { x: 204, y: 68 }, target: { x: 62, y: 48 } },
    { source: { x: 16, y: 102 }, target: { x: 97, y: 48 } },
    { source: { x: 51, y: 102 }, target: { x: 132, y: 48 } },
    { source: { x: 86, y: 102 }, target: { x: 167, y: 48 } },
  ];
  for (const progress of [0.68, 0.72, 0.78, 0.82]) {
    const current = words.map((word) => exposureWordTranslation(word, progress));
    expect(current.map((word) => word.y)).toEqual([68, 102, 102, 102]);
    expect(current[1].x).toBeLessThan(current[2].x);
    expect(current[2].x).toBeLessThan(current[3].x);
  }
  for (const progress of [0.82, 0.86, 0.92, 0.96, 1]) {
    const current = words.map((word) => exposureWordTranslation(word, progress));
    expect(current.map((word) => word.x)).toEqual([62, 97, 132, 167]);
    expect(current[0].y).toBeLessThanOrEqual(current[1].y);
  }
  expect(words.map((word) => exposureWordTranslation(word, 1))).toEqual(
    words.map((word) => word.target),
  );
});

it('holds the final pair and exactly retraces every intermediate position when scrolling backward', () => {
  const word = { source: { x: 84, y: 10 }, target: { x: 560, y: 360 } };
  const positions = [0, 0.5, 0.59, 0.68, 0.75, 0.82, 0.89, 0.96, 1];
  const forward = positions.map((progress) => exposureWordTranslation(word, progress));
  const reverse = positions.toReversed().map((progress) => exposureWordTranslation(word, progress));
  expect(reverse).toEqual(forward.toReversed());
  expect(forward[0]).toEqual(word.source);
  expect(forward.at(-1)).toEqual(word.target);
  expect(exposureWordTranslation(word, 0.96)).toEqual(word.target);
  expect(exposureWordTranslation(word, 2)).toEqual(word.target);
  expect(exposureWordTranslation(word, -1)).toEqual(word.source);
});
