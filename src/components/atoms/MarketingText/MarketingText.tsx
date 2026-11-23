import { fieldTypography } from '@/lib/site-editor/text-presentation';
import type { MarketingTextProps } from './types';

export function MarketingText({ field, as: Tag, editing }: MarketingTextProps) {
  if (!field || (!field.value && !editing)) return null;
  const paragraphs = Tag === 'div' && !editing;
  return (
    <Tag
      data-site-field={field.id}
      data-canvas-field={editing ? field.kind : undefined}
      data-placeholder={editing ? field.label : undefined}
      tabIndex={editing ? 0 : undefined}
      aria-description={editing ? 'Редагувати · ' + field.label : undefined}
      style={fieldTypography(field.style)}
    >
      {paragraphs
        ? field.value.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)
        : field.value}
    </Tag>
  );
}
