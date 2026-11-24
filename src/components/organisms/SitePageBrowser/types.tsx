import type { EditorTarget } from '@/lib/site-editor/storage/types';
import type { BrowserPage } from '@/lib/site-editor/types';

export type SitePageBrowserProps = {
  pages: BrowserPage[];
  /** Environments this admin manages, in display order. */
  environments: EditorTarget[];
  target: EditorTarget;
  onTarget: (target: EditorTarget) => void;
  initialPath?: string;
  disabled: boolean;
  onOpen: (path: string, target: EditorTarget) => void;
  onPublishToProduction?: (path: string) => void;
};
export type BrowserView = 'list' | 'detail';
