import type { EditorPage } from '@/lib/site-editor/types';

export type SiteContentSyncProps = {
  /** Page handed over from the staging editor; it is shown first and ready to confirm. */
  focusPath?: string;
  onClose: () => void;
  onPublished: (result: EditorPage) => void;
};
export type SyncTask = { path: string; kind: 'confirm' | 'publish' } | null;
