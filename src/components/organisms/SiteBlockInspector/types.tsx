import type { BlockPosition, SitePage, SiteSection, TextStyle } from '@/lib/site-editor/types';
import type { WorkshopTicketPresentation } from '@/lib/site-editor/workshop-ticket/types';

export type PendingBlockInsertion = { position: BlockPosition; label: string; canvas: boolean };

export type CompositionControls = {
  page: SitePage | null;
  sectionId: string;
  disabled: boolean;
  onChange: (page: SitePage) => void;
  onSelect: (sectionId: string, fieldId?: string, focus?: boolean) => void;
  onMessage: (message: string) => void;
};

export type SiteBlockInspectorProps = {
  section: SiteSection;
  ticket?: WorkshopTicketPresentation;
  fieldId: string;
  disabled: boolean;
  removableImages: boolean;
  onSelectField: (fieldId: string) => void;
  onChange: (fieldId: string, value: string) => void;
  onStyle: (fieldId: string, style?: TextStyle) => void;
  onChooseImage: (fieldId: string) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onMoveItem: (id: string, direction: -1 | 1) => void;
};
