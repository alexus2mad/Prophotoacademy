import type { LearningBlock, Lesson } from './types';

export function hasFinalQuiz(lesson: Lesson) {
  const quizzes = lesson.blocks.filter((block) => block.kind === 'quiz');
  return (
    quizzes.length === 1 &&
    lesson.blocks.at(-1)?.id === quizzes[0].id &&
    !!quizzes[0].quiz?.questions.length
  );
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
