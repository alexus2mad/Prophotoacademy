import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { nativeTypographyRules } from '@/lib/site-editor/text-presentation';
import type { MarketingCompositionProps } from './types';

export function MarketingComposition({ page, within, part, ticket }: MarketingCompositionProps) {
  if (!page) return null;
  const rules = part === 'blocks' ? '' : nativeTypographyRules(page.sections, within);
  return (
    <>
      {rules && <style data-site-typography="">{rules}</style>}
      {part !== 'typography' && <MarketingSlot page={page} id="end" ticket={ticket} />}
    </>
  );
}
