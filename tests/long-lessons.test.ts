import { describe, expect, it } from 'vitest';
import { lessonSchema } from '../src/lib/learning/schema';
import { lessonBlockGroups } from '../src/lib/learning/presentation';
import type { LearningBlock } from '../src/lib/learning/types';

describe('complete editorial lessons', () => {
  const image: LearningBlock = {
    id: 'image',
    kind: 'image',
    title: '',
    required: false,
    revision: 1,
    imageWidth: 2400,
    imageHeight: 1350,
  };
  it('accepts 300 materials and rejects larger lessons', () => {
    const lesson = {
      id: 'lesson',
      title: 'Lesson',
      summary: '',
      blocks: Array.from({ length: 300 }, (_, i) => ({ ...image, id: 'image-' + i })),
    };
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
    expect(lessonSchema.safeParse({ ...lesson, blocks: [...lesson.blocks, image] }).success).toBe(
      false,
    );
  });
  it('keeps annotated diagrams wide and photograph pairs in source order', () => {
    expect(
      lessonBlockGroups([
        image,
        { ...image, id: 'diagram', imageLayout: 'wide' },
        { ...image, id: 'b' },
        { ...image, id: 'c' },
      ]).map((g) => g.map((b) => b.id)),
    ).toEqual([['image'], ['diagram'], ['b', 'c']]);
  });
});
