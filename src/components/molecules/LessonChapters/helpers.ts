export function currentChapterIndex(tops: number[], readingLine: number, atBottom: boolean) {
  if (!tops.length) return -1;
  if (atBottom) return tops.length - 1;
  const index = tops.findLastIndex((top) => top <= readingLine);
  return Math.max(0, index);
}
