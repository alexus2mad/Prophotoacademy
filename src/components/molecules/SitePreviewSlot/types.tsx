import type { BlockPosition, SiteSection } from '@/lib/site-editor/types';

export type SitePreviewSlotProps = {
  slot: string;
  label: string;
  blocks: SiteSection[];
  editable: boolean;
  selected: string;
  onInsert: (position: BlockPosition, label: string) => void;
  onChooseMove: (id: string) => void;
};
