import { MarketingBlock } from '@/components/molecules/MarketingBlock/MarketingBlock';
import { nativeTypographyRules } from '@/lib/site-editor/text-presentation';
import type { MarketingCompositionProps } from './types';

export function MarketingComposition({ page, within, part }: MarketingCompositionProps) {
  if (!page) return null;
  const blocks = part === 'typography' ? [] : page.sections.filter((section) => section.blockType);
  const rules = part === 'blocks' ? '' : nativeTypographyRules(page.sections, within);
  if (!blocks.length && !rules) return null;
  return (
    <>
      {rules && <style data-site-typography="">{rules}</style>}
      {blocks.length > 0 && (
        <div data-site-composition={page.path}>
          {blocks.map((section) => (
            <MarketingBlock key={section.id} section={section} />
          ))}
        </div>
      )}
    </>
  );
}
