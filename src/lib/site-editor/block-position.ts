import { pagePlacements } from './placements';
import type { BlockPosition, SitePage, SiteSection } from './types';

export function getBlockSlot(section: SiteSection) {
  return section.placement ?? 'end';
}

function place(page: SitePage, block: SiteSection, position: BlockPosition) {
  const slots = pagePlacements(page).map(({ id }) => id);
  if (!slots.includes(position.slot) || position.beforeBlockId === block.id) return page;

  const authored = page.sections.filter((s) => s.blockType);
  const peers = authored.filter((s) => getBlockSlot(s) === position.slot);
  const before = position.beforeBlockId;
  if (before !== undefined && !peers.some((s) => s.id === before)) return page;

  const current = peers.findIndex((s) => s.id === block.id);
  if (current !== -1 && peers[current + 1]?.id === before) return page;

  // Keep the stored order useful to the inspector as well as to the template.
  const groups = new Map<string, SiteSection[]>(slots.map((slot) => [slot, []]));
  for (const section of authored) {
    if (section.id !== block.id)
      (groups.get(getBlockSlot(section)) ?? groups.get('end')!).push(section);
  }
  const target = groups.get(position.slot)!;
  const moved: SiteSection = { ...block, placement: position.slot };
  if (position.slot === 'end') delete moved.placement;
  target.splice(
    before === undefined ? target.length : target.findIndex((s) => s.id === before),
    0,
    moved,
  );
  return {
    ...page,
    sections: [
      ...page.sections.filter((s) => !s.blockType),
      ...slots.flatMap((slot) => groups.get(slot) ?? []),
    ],
  };
}

export function addBlockAt(page: SitePage, block: SiteSection, position: BlockPosition) {
  if (!block.blockType || page.sections.some((s) => s.id === block.id)) return page;
  return place(page, block, position);
}

export function moveBlockTo(page: SitePage, blockId: string, position: BlockPosition) {
  const block = page.sections.find((s) => s.id === blockId && s.blockType);
  return block ? place(page, block, position) : page;
}
