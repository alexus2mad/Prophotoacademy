import type { PortableBlock } from '@/lib/content/types';
import type { SitePage } from './types';

// Keep Portable Text's links, marks, lists and spacing. Bind only the source spans with formatting.
export function legalTypography(blocks: PortableBlock[], page?: SitePage) {
  return blocks.map((block) => {
    const section = page?.sections.find((item) => item.id === 'block-' + block._key);
    if (!section) return block;
    const styled = new Set(section.fields.filter((field) => field.style).map((field) => field.id));
    if (!styled.size) return block;
    const markDefs = [...block.markDefs];
    const children = block.children.map((span) => {
      const fieldId = 'span-' + span._key;
      if (!styled.has(fieldId)) return span;
      const key = 'typography-' + span._key;
      markDefs.push({ _key: key, _type: 'siteTypography', sectionId: section.id, fieldId });
      return { ...span, marks: [...span.marks, key] };
    });
    return { ...block, children, markDefs };
  });
}
