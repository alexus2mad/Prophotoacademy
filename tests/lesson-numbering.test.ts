import { describe, expect, it } from 'vitest';
import { numberedLessons, lessonLabel, numberCourse } from '../src/lib/learning/numbering';
import { publicationDraft } from '../src/lib/learning/publication';
import { blockSchema, draftSchema } from '../src/lib/learning/schema';
import { youtubeVideoId } from '../src/lib/learning/youtube';
import type { CourseDraft } from '../src/lib/learning/types';

const course: CourseDraft = {
  id: 'course',
  programId: 'program',
  title: 'Course',
  description: '',
  cover: '',
  modules: [
    {
      id: 'module-a',
      title: 'First',
      lessons: [{ id: 'second', number: 2, title: 'Composition', summary: '', blocks: [] }],
    },
    {
      id: 'module-b',
      title: 'Next',
      lessons: [{ id: 'third', title: 'Light', summary: '', blocks: [] }],
    },
  ],
};
describe('lecture numbers', () => {
  it('continues through modules from an explicitly numbered second lecture', () => {
    expect(numberedLessons(course).map((l) => l.number)).toEqual([2, 3]);
    expect(lessonLabel(course, course.modules[0].lessons[0])).toBe('Лекція 2 — Composition');
  });
  it('keeps numbers when only some lessons are published and does not mutate the draft', () => {
    expect(publicationDraft(course, ['third']).modules[0].lessons[0].number).toBe(3);
    expect(course.modules[1].lessons[0].number).toBeUndefined();
    expect(numberCourse(numberCourse(course))).toEqual(numberCourse(course));
  });
  it('does not assign an automatic number already reserved explicitly', () => {
    const changed = structuredClone(course);
    changed.modules[0].lessons[0].number = undefined;
    changed.modules[1].lessons[0].number = 1;
    expect(numberedLessons(changed).map((l) => l.number)).toEqual([2, 1]);
    changed.modules[0].lessons[0].number = 1;
    expect(draftSchema.safeParse(changed).success).toBe(false);
  });
});
describe('YouTube recordings', () => {
  it('accepts only recognized HTTPS YouTube video URLs and builds from the video ID', () => {
    for (const url of [
      'https://youtu.be/CbEmAiZr_eg',
      'https://www.youtube.com/watch?v=CbEmAiZr_eg&si=example',
      'https://www.youtube.com/embed/CbEmAiZr_eg',
    ])
      expect(youtubeVideoId(url)).toBe('CbEmAiZr_eg');
    for (const url of [
      'javascript:alert(1)',
      'https://youtube.com.evil.test/watch?v=CbEmAiZr_eg',
      'https://evil.test/CbEmAiZr_eg',
      'http://youtu.be/CbEmAiZr_eg',
      'https://youtu.be/no',
      'https://user@youtu.be/CbEmAiZr_eg',
    ])
      expect(youtubeVideoId(url)).toBeUndefined();
  });
  it('preserves a valid recording in authored data and rejects invalid embeds', () => {
    const block = {
      id: 'recording',
      kind: 'video',
      required: false,
      title: 'Recording',
      revision: 1,
      youtubeUrl: 'https://youtu.be/CbEmAiZr_eg',
    };
    expect(blockSchema.parse(block).youtubeUrl).toBe(block.youtubeUrl);
    expect(blockSchema.safeParse({ ...block, youtubeUrl: 'https://evil.test' }).success).toBe(
      false,
    );
  });
});
