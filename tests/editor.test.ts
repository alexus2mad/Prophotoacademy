import { describe, expect, it } from 'vitest';
import { changeCourseBlock, materialLabel } from '../src/lib/learning/editor';
import { demoCourse } from '../src/lib/learning/demo';

describe('course authoring edits', () => {
  it('applies a delayed upload to its own block without replacing edits in another lesson', () => {
    const draft = structuredClone(demoCourse);
    const otherLesson = draft.modules[0].lessons[0];
    otherLesson.summary = 'Edited while a material was uploading';
    const old = draft.modules[1].lessons[0].blocks[0];
    const result = changeCourseBlock(draft, old.id, { mediaId: 'new-upload' });
    expect(result.modules[0].lessons[0].summary).toBe(otherLesson.summary);
    expect(result.modules[1].lessons[0].blocks[0].mediaId).toBe('new-upload');
    expect(result.modules[1].lessons[0].blocks[0].revision).toBe(old.revision + 1);
    expect(old.mediaId).not.toBe('new-upload');
    expect(result.modules[1].lessons[0].blocks[1]).toEqual(draft.modules[1].lessons[0].blocks[1]);
  });
  it('cannot re-create a removed block when a delayed upload returns', () => {
    expect(changeCourseBlock(demoCourse, 'removed-block', { mediaId: 'late-upload' })).toEqual(
      demoCourse,
    );
  });
  it('gives untitled visual material a meaningful outline label', () => {
    const block = { ...demoCourse.modules[1].lessons[0].blocks[0], title: '' };
    expect(materialLabel(block)).toBe(block.caption);
    expect(materialLabel({ ...block, caption: '', alt: '' })).toBe('Зображення');
  });
});
