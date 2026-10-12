import type { CourseDraft, LearningBlock } from './types';

export const materialNames: Record<LearningBlock['kind'], string> = {
  article: 'Текст',
  image: 'Зображення',
  video: 'Відео',
  pdf: 'PDF',
  file: 'Файл',
  zoom: 'Zoom',
  quiz: 'Тест',
};
export function materialLabel(block: LearningBlock) {
  return block.title || block.caption || block.alt || materialNames[block.kind];
}
export function changeCourseBlock(
  draft: CourseDraft,
  id: string,
  change: Partial<Omit<LearningBlock, 'id' | 'revision'>>,
) {
  return {
    ...draft,
    modules: draft.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        blocks: lesson.blocks.map((block) =>
          block.id === id ? { ...block, ...change, revision: block.revision + 1 } : block,
        ),
      })),
    })),
  };
}
