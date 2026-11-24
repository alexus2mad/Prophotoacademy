import { blocksAtPlacement, pagePlacements } from '@/lib/site-editor/placements';
import { MarketingBlock } from '@/components/molecules/MarketingBlock/MarketingBlock';
import type { MarketingSlotProps } from './types';

export function MarketingSlot({ page, id, ticket }: MarketingSlotProps) {
  if (!page || (!page.editorPreview && !page.sections.some((s) => s.blockType))) return null;
  const slot = pagePlacements(page).find((s) => s.id === id);
  if (!slot) return null;
  const blocks = blocksAtPlacement(page, id);
  if (!blocks.length && !page.editorPreview) return null;
  return (
    <div
      data-site-composition={page.path}
      data-site-placement={id}
      data-site-placement-label={slot.label}
    >
      {blocks.map((section) => (
        <MarketingBlock
          key={section.id}
          section={section}
          ticket={ticket}
          editing={page.editorPreview}
        />
      ))}
    </div>
  );
}
