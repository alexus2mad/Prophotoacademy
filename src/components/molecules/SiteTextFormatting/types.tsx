import type { TextStyle } from '@/lib/site-editor/types';

export type SiteTextFormattingProps = {
  fieldLabel: string;
  style?: TextStyle;
  disabled: boolean;
  onChange: (style?: TextStyle) => void;
};
export type StyleOptions = {
  [Key in keyof Required<TextStyle>]: Record<NonNullable<TextStyle[Key]>, string>;
};
