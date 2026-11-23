import type { BlockPosition, SitePage, SiteSection } from '@/lib/site-editor/types';
export type SiteMoveBlockDialogProps = {
  page: SitePage;
  block: SiteSection;
  onMove: (position: BlockPosition) => void;
  onClose: () => void;
};
