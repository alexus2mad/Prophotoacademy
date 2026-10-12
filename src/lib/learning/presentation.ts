import type { LearningBlock, Lesson } from './types';

export function hasRequiredMaterial(lesson: Lesson) {
  return lesson.blocks.some((block) => block.required);
}

// Adjacent photographs form pairs without changing their reading order or cropping the sources.
export function lessonBlockGroups(blocks: LearningBlock[]) {
  const groups: LearningBlock[][] = [];
  for (const block of blocks) {
    const previous = groups.at(-1);
    if (block.kind === 'image' && previous?.length === 1 && previous[0].kind === 'image')
      previous.push(block);
    else groups.push([block]);
  }
  return groups;
}
