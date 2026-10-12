import { describe, expect, it } from 'vitest';
import { publicationDraft } from '../src/lib/learning/publication';
import { hasRequiredMaterial } from '../src/lib/learning/presentation';
import { publicationSchema } from '../src/lib/learning/schema';
import type { CourseDraft } from '../src/lib/learning/types';

const draft: CourseDraft = {
  id: 'course',
  programId: 'program',
  title: 'Course',
  description: '',
  cover: '',
  revision: 'current',
  modules: [
    {
      id: 'first',
      title: 'Foundations',
      lessons: [
        {
          id: 'ready',
          title: 'Ready',
          summary: '',
          blocks: [
            {
              id: 'text',
              kind: 'article',
              required: true,
              title: '',
              body: 'Teaching content',
              revision: 1,
            },
          ],
        },
        { id: 'outline', title: 'Outline', summary: '', blocks: [] },
      ],
    },
    {
      id: 'later',
      title: 'Later',
      lessons: [{ id: 'unfinished', title: 'Unfinished', summary: '', blocks: [] }],
    },
  ],
};

describe('selective course publication', () => {
  it('publishes selected lessons in curriculum order without discarding the authoring draft', () => {
    const selected = publicationDraft(draft, ['ready']);
    expect(selected.modules).toHaveLength(1);
    expect(selected.modules[0].lessons.map((l) => l.id)).toEqual(['ready']);
    expect(draft.modules).toHaveLength(2);
    expect(draft.modules[0].lessons).toHaveLength(2);
    selected.modules[0].lessons[0].blocks[0].body = 'Changed snapshot';
    expect(draft.modules[0].lessons[0].blocks[0].body).toBe('Teaching content');
    expect(selected.revision).toBe('current');
  });
  it('rejects empty, duplicate and unknown selections', () => {
    for (const selection of [[], ['ready', 'ready'], ['foreign']])
      expect(() => publicationDraft(draft, selection)).toThrow(/Оберіть наявні уроки/);
  });
  it('keeps full-publication callers compatible and leaves validation of media to the publisher', () => {
    expect(publicationDraft(draft)).toEqual(draft);
    expect(publicationDraft(draft)).not.toBe(draft);
    expect(hasRequiredMaterial(draft.modules[0].lessons[0])).toBe(true);
    expect(hasRequiredMaterial(draft.modules[0].lessons[1])).toBe(false);
  });
  it('validates publication requests before processing a revision', () => {
    expect(publicationSchema.safeParse({ revision: 'current', lessonIds: [] }).success).toBe(false);
    expect(publicationSchema.safeParse({ revision: '', lessonIds: ['ready'] }).success).toBe(false);
    expect(
      publicationSchema.parse({ revision: 'current', lessonIds: ['ready'] }).lessonIds,
    ).toEqual(['ready']);
  });
});
