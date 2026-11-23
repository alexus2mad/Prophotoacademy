import type { SiteField } from '@/lib/site-editor/types';
export type MarketingTextProps = {
  field?: SiteField;
  as: 'h2' | 'h3' | 'p' | 'figcaption' | 'div';
  editing?: boolean;
};
