import type { PortableBlock } from '@/lib/content/types';

export function isLegalHeading(block: PortableBlock) {
  return /^h[1-6]$/.test(block.style);
}

// A chapter boundary never splits adjacent paragraphs or items belonging to one Portable Text list.
export function legalChapters(body: PortableBlock[]) {
  const chapters: PortableBlock[][] = [];
  for (const block of body) {
    if (!chapters.length || isLegalHeading(block)) chapters.push([]);
    chapters[chapters.length - 1].push(block);
  }
  return chapters;
}
