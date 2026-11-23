import type { SiteField, TextStyle } from '@/lib/site-editor/types';

export type SiteEditorFieldProps = {
  field: SiteField;
  disabled: boolean;
  removable: boolean;
  onChange: (value: string) => void;
  selected?: boolean;
  onStyle: (style?: TextStyle) => void;
  onChooseImage: () => void;
};
