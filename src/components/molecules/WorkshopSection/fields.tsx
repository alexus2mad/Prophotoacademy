import type { ReactNode } from 'react';
import { MarketingText } from '@/components/atoms/MarketingText/MarketingText';
import type { MarketingTextProps } from '@/components/atoms/MarketingText/types';
import { itemFieldId } from '@/lib/site-editor/blocks';
import type { SiteSection } from '@/lib/site-editor/types';

export function workshopFields(section: SiteSection, editing = false) {
  const fields = new Map(section.fields.map((field) => [field.id, field]));
  const value = (id: string) => fields.get(id)?.value ?? '';
  function copy(
    id: string,
    as: MarketingTextProps['as'] = 'span',
    className?: string,
    children?: ReactNode,
  ) {
    return (
      <MarketingText field={fields.get(id)} as={as} editing={editing} className={className}>
        {children}
      </MarketingText>
    );
  }
  return { copy, value, itemFieldId, itemIds: section.itemIds ?? [] };
}
