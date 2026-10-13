import { describe, expect, it } from 'vitest';
import { currentChapterIndex } from '../src/components/molecules/LessonChapters/helpers';

describe('chapter viewport navigation', () => {
  it('keeps a chapter active throughout a long sequence of photographs', () => {
    expect(currentChapterIndex([-4200, 900, 3000], 224, false)).toBe(0);
    expect(currentChapterIndex([-5100, 0, 2100], 224, false)).toBe(1);
  });
  it('reverses the current position when scrolling back instead of recording read history', () => {
    expect(currentChapterIndex([-1000, -300, 220], 224, false)).toBe(2);
    expect(currentChapterIndex([-700, 0, 520], 224, false)).toBe(1);
    expect(currentChapterIndex([300, 1000, 1520], 224, false)).toBe(0);
  });
  it('uses the final chapter at the page bottom even when it is shorter than the viewport', () => {
    expect(currentChapterIndex([-700, 450], 224, true)).toBe(1);
  });
  it('handles layout shifts, exact boundaries and an empty outline', () => {
    expect(currentChapterIndex([-700, 224], 224, false)).toBe(1);
    expect(currentChapterIndex([-700, 300], 224, false)).toBe(0);
    expect(currentChapterIndex([], 224, true)).toBe(-1);
  });
});
