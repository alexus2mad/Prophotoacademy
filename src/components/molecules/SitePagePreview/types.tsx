import type { EditorTarget } from '@/lib/site-editor/storage/types';
import type { EnvironmentState } from '@/lib/site-editor/types';

export type SitePagePreviewProps = {
  path: string;
  title: string;
  target: EditorTarget;
  state: EnvironmentState;
};
export type PreviewDevice = 'desktop' | 'phone';
export type PreviewVersion = 'draft' | 'published';
