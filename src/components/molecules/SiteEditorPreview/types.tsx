import type { WorkshopTicketPresentation } from '@/lib/site-editor/workshop-ticket/types';
import type { BlockPosition, SiteField, SitePage } from '@/lib/site-editor/types';
import type { EditorTarget } from '@/lib/site-editor/storage/types';

export type PreviewField = { sectionId: string; fieldId: string };

export type PreviewFieldCandidates = { field: PreviewField; nodes: (HTMLElement | Text)[] };

export type SiteEditorPreviewProps = {
  page: SitePage;
  savedPage: SitePage;
  ticket?: WorkshopTicketPresentation;
  sectionId: string;
  editable: boolean;
  onSelect: (field: PreviewField) => void;
  onChange: (field: PreviewField, value: string) => void;
  onReplaceImage: (field: PreviewField) => void;
  onInsertAt: (position: BlockPosition, label: string) => void;
  onMoveTo: (id: string, position: BlockPosition) => void;
  version: number;
  focusNewBlock?: string;
  /** Environment whose saved version the frame renders. */
  target?: EditorTarget;
};

export type PreviewHost = { element: HTMLElement; slot: string; label: string };
export type CanvasDrag = {
  id: string;
  pointer: number;
  startedX: number;
  startedY: number;
  x: number;
  y: number;
  grip: HTMLElement;
  indicator?: HTMLElement;
  target?: HTMLElement;
};

export type CanvasTarget = {
  element: HTMLElement;
  field: PreviewField;
  original: SiteField;
  shown: string;
  restore: () => void;
};
