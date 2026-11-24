import type { MarketingBlockProps } from '@/components/molecules/MarketingBlock/types';
import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import { workshopFields } from '@/components/molecules/WorkshopSection/fields';
import styles from './WorkshopProgram.module.css';

function bulletText(line: string) {
  return line
    .split(/(\*\*[^*\n]+\*\*)/g)
    .map((part, i) => (i % 2 === 1 ? <strong key={i}>{part.slice(2, -2)}</strong> : part));
}

export function WorkshopProgram({ section, editing }: MarketingBlockProps) {
  const { copy, value, itemFieldId, itemIds } = workshopFields(section, editing);
  return (
    <>
      <StudioCreatorHeading
        id={section.id + '-title'}
        label={value('eyebrow') || editing ? copy('eyebrow') : undefined}
      >
        {copy('heading')} {copy('accent', 'span', 'studio-hand')}
      </StudioCreatorHeading>
      <div className={styles.modules}>
        {itemIds.map((id, i) => {
          const textId = itemFieldId(id, 'text');
          const bullets = value(textId)
            .split('\n')
            .filter((line) => line.trim());
          return (
            <details className={styles.module} open={i === 0} key={id}>
              <summary>
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {copy(itemFieldId(id, 'title'), 'span', styles.moduleTitle)}
                <span className={styles.indicator} aria-hidden="true" />
              </summary>
              {copy(
                textId,
                'ul',
                undefined,
                bullets.map((line, j) => <li key={j}>{bulletText(line)}</li>),
              )}
            </details>
          );
        })}
      </div>
    </>
  );
}
