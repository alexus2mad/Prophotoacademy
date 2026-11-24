import type { SiteField } from '@/lib/site-editor/types';
import type { ReactNode } from 'react';
export type MarketingTextProps = {
  field?: SiteField;
  as: 'h2' | 'h3' | 'p' | 'figcaption' | 'div' | 'span' | 'strong' | 'ul';
  editing?: boolean;
  className?: string;
  children?: ReactNode;
};
