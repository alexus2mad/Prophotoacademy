import type { SitePage } from '@/lib/site-editor/types';

export type PreviewField = { sectionId: string; fieldId: string };

export type SiteEditorPreviewProps = {
  page: SitePage;
  sectionId: string;
  onInspect: (field: PreviewField) => void;
  version: number;
  dirty: boolean;
};
