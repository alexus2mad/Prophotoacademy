import type { SiteField } from '@/lib/site-editor/types';

export type SiteEditorFieldProps = {
  field: SiteField;
  disabled: boolean;
  removable: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
};
