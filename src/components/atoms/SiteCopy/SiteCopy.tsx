import { createElement } from 'react';
import type { SiteCopyProps } from './types';

// Mixed headings often give every span a decorative typeface. A neutral inline element
// keeps the native typography while giving this particular text run a stable identity.
export function SiteCopy({ id, children }: SiteCopyProps) {
  return createElement('site-copy', { 'data-site-field': id }, children);
}
