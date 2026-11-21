import type { SiteField, SitePage } from '@/lib/site-editor/types';

export type PreviewField = { sectionId: string; fieldId: string };

export type PreviewFieldCandidates = { field: PreviewField; nodes: (HTMLElement | Text)[] };

export type SiteEditorPreviewProps = {
  page: SitePage;
  savedPage: SitePage;
  sectionId: string;
  editable: boolean;
  onSelect: (field: PreviewField) => void;
  onChange: (field: PreviewField, value: string) => void;
  onReplaceImage: (field: PreviewField) => void;
  version: number;
};

export type CanvasTarget = {
  element: HTMLElement;
  field: PreviewField;
  original: SiteField;
  shown: string;
  restore: () => void;
};
