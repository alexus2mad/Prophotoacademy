import type { SitePage, SiteSection, TextStyle } from '@/lib/site-editor/types';

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
