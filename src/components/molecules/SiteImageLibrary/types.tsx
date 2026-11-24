import type { EditorTarget } from '@/lib/site-editor/storage/types';

export type SiteImageLibraryProps = {
  current: string;
  /** Environment whose photo library and uploads are used. */
  target?: EditorTarget;
  onChoose: (url: string) => void;
  onClose: () => void;
};
