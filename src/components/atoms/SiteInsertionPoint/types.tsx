import type { BlockPosition } from '@/lib/site-editor/types';
export type SiteInsertionPointProps = {
  position: BlockPosition;
  label: string;
  onChoose: () => void;
};
