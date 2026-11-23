import type { BlockType } from '@/lib/site-editor/types';

export type SiteBlockLibraryProps = {
  afterLabel?: string;
  onChoose: (kind: BlockType) => void;
  onClose: () => void;
};
