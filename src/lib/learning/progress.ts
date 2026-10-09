import type {
  Interval,
  LearningBlock,
  Lesson,
  LessonProgress,
  BlockProgress,
  ProgressEvent,
} from './types';
export function mergeRanges(input: Interval[], limit = Infinity): Interval[] {
  const sorted = input
    .map(([a, b]) => [Math.max(0, a), Math.min(limit, b)] as Interval)
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b > a)
    .sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [];
  for (const range of sorted) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}
export const rangeSeconds = (ranges: Interval[]) =>
  mergeRanges(ranges).reduce((sum, [a, b]) => sum + b - a, 0);
export function expectedSeconds(block: LearningBlock) {
  if (block.expectedSeconds) return block.expectedSeconds;
  if (block.kind === 'video') return block.duration || 60;
  if (block.kind === 'article')
    return Math.max(5, ((block.body?.trim().split(/\s+/).length || 1) * 60) / 200);
  if (block.kind === 'pdf') return (block.pageSeconds || [10]).reduce((a, b) => a + b, 0);
  return block.kind === 'image' ? 5 : 60;
}
export function blockFraction(block: LearningBlock, state?: BlockProgress) {
  if (!state || state.revision !== block.revision) return 0;
  if (state.completed) return 1;
  if (block.kind === 'video')
    return Math.min(
      1,
      rangeSeconds(state.ranges) / ((block.duration || expectedSeconds(block)) * 0.9),
    );
  if (block.kind === 'article')
    return Math.min(
      1,
      state.coverage.length / 90,
      state.activeSeconds / (expectedSeconds(block) * 0.8),
    );
  if (block.kind === 'image') return Math.min(1, state.activeSeconds / expectedSeconds(block));
  if (block.kind === 'pdf') {
    const pages = block.pageSeconds || [10];
    const read = pages.filter(
      (seconds, i) => (state.pageSeconds[String(i)] || 0) >= seconds * 0.8,
    ).length;
    return Math.min(1, read / Math.ceil(pages.length * 0.9));
  }
  return 0;
}
export function lessonFraction(lesson: Lesson, state: LessonProgress) {
  if (state.manual) return 1;
  const blocks = lesson.blocks.filter((b) => b.required);
  if (!blocks.length) return 0;
  const total = blocks.reduce((sum, b) => sum + expectedSeconds(b), 0);
  return (
    blocks.reduce((sum, b) => sum + blockFraction(b, state.blocks[b.id]) * expectedSeconds(b), 0) /
    total
  );
}
export function applyProgress(
  lesson: Lesson,
  previous: LessonProgress,
  event: ProgressEvent,
  maxElapsed: number,
) {
  if (event.manual) return { ...previous, manual: 'student' as const };
  const block = lesson.blocks.find((b) => b.id === event.blockId && b.revision === event.revision);
  if (!block) throw new Error('Матеріал змінився. Оновіть урок');
  const current = previous.blocks[block.id];
  const state: BlockProgress =
    current?.revision === block.revision
      ? structuredClone(current)
      : {
          revision: block.revision,
          ranges: [],
          coverage: [],
          activeSeconds: 0,
          pageSeconds: {},
          position: 0,
        };
  const elapsed = Math.max(0, Math.min(event.elapsed, maxElapsed, 30));
  // Playback timestamps alone are insufficient: credit cannot exceed the elapsed session budget at 2x.
  if (block.kind === 'video' && event.ranges) {
    const ranges = mergeRanges(event.ranges, block.duration || expectedSeconds(block));
    if (rangeSeconds(ranges) <= elapsed * 2 + 1)
      state.ranges = mergeRanges(
        [...state.ranges, ...ranges],
        block.duration || expectedSeconds(block),
      );
  }
  if (block.kind === 'article' && elapsed > 0)
    state.coverage = [
      ...new Set([
        ...state.coverage,
        ...(event.coverage || []).filter((x) => Number.isInteger(x) && x >= 0 && x < 100),
      ]),
    ];
  if (
    block.kind === 'pdf' &&
    event.page !== undefined &&
    event.page >= 0 &&
    event.page < (block.pageSeconds?.length || 1)
  )
    state.pageSeconds[String(event.page)] = Math.min(
      (state.pageSeconds[String(event.page)] || 0) + elapsed,
      block.pageSeconds?.[event.page] || 10,
    );
  state.activeSeconds = Math.min(state.activeSeconds + elapsed, expectedSeconds(block));
  if (event.position !== undefined)
    state.position = Math.max(
      0,
      Math.min(event.position, block.duration || expectedSeconds(block)),
    );
  return { ...previous, lastBlockId: block.id, blocks: { ...previous.blocks, [block.id]: state } };
}
