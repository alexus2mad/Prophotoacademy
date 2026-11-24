import { MarketingText } from '@/components/atoms/MarketingText/MarketingText';
import { MarketingPhoto } from '@/components/atoms/MarketingPhoto/MarketingPhoto';
import { MarketingCarousel } from '@/components/molecules/MarketingCarousel/MarketingCarousel';
import { fieldTypography } from '@/lib/site-editor/text-presentation';
import { validCardLink } from '@/lib/site-editor/card-link';
import { itemFieldId } from '@/lib/site-editor/blocks';
import { WorkshopSection } from '@/components/molecules/WorkshopSection/WorkshopSection';
import type { MarketingBlockProps } from './types';
import styles from './MarketingBlock.module.css';

export function MarketingBlock({ section, editing, preview, ticket }: MarketingBlockProps) {
  if (section.blockType?.startsWith('intensive-'))
    return (
      <WorkshopSection section={section} editing={editing} preview={preview} ticket={ticket} />
    );
  const fields = new Map(section.fields.map((field) => [field.id, field]));
  const { blockType, itemIds = [] } = section;
  function photo(id: string, alt: string, sizes?: string) {
    return (
      <MarketingPhoto
        image={fields.get(id)}
        alt={fields.get(alt)?.value}
        editing={editing}
        sizes={sizes}
      />
    );
  }
  const heading = <MarketingText as="h2" field={fields.get('heading')} editing={editing} />;
  return (
    <section className={styles.block} data-site-section={section.id} data-block-type={blockType}>
      <div className={styles.inner}>
        {heading}
        {blockType === 'paragraph' && (
          <MarketingText as="div" editing={editing} field={fields.get('text')} />
        )}
        {blockType === 'image' && (
          <figure>
            {photo('image', 'alt')}
            <MarketingText as="figcaption" field={fields.get('caption')} editing={editing} />
          </figure>
        )}
        {blockType === 'cards' && (
          <ul className={styles.cards}>
            {itemIds.map((id) => {
              const get = (key: string) => fields.get(itemFieldId(id, key));
              const href = get('href')?.value.trim();
              const validLink = href && validCardLink(href);
              return (
                <li key={id}>
                  <article>
                    {photo(
                      itemFieldId(id, 'image'),
                      itemFieldId(id, 'alt'),
                      '(max-width: 700px) 100vw, 380px',
                    )}
                    <h3
                      data-site-field={get('title')?.id}
                      data-canvas-field={editing ? 'text' : undefined}
                      tabIndex={editing ? 0 : undefined}
                      data-placeholder={editing ? 'Заголовок картки' : undefined}
                      style={fieldTypography(get('title')?.style)}
                    >
                      {validLink && !editing ? (
                        <a href={href}>{get('title')?.value}</a>
                      ) : (
                        get('title')?.value
                      )}
                    </h3>
                    <MarketingText as="div" field={get('text')} editing={editing} />
                  </article>
                </li>
              );
            })}
          </ul>
        )}
        {blockType === 'carousel' && (
          <MarketingCarousel
            count={itemIds.length}
            label={fields.get('heading')?.value || 'Фотогалерея'}
          >
            {itemIds.map((id) => (
              <li key={id}>
                <figure>
                  {photo(itemFieldId(id, 'image'), itemFieldId(id, 'alt'))}
                  <MarketingText
                    as="figcaption"
                    field={fields.get(itemFieldId(id, 'caption'))}
                    editing={editing}
                  />
                </figure>
              </li>
            ))}
          </MarketingCarousel>
        )}
      </div>
    </section>
  );
}
