import type { BlockType } from '@/lib/site-editor/types';

export type SiteBlockLibraryProps = {
  locationLabel: string;
  onChoose: (kind: BlockType) => void;
  onClose: () => void;
};
