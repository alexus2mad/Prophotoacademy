import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import type { MarketingBlockProps } from '@/components/molecules/MarketingBlock/types';
import { workshopFields } from '@/components/molecules/WorkshopSection/fields';
import styles from './WorkshopFormat.module.css';

export function WorkshopFormat({ section, editing }: MarketingBlockProps) {
  const { copy, itemFieldId, itemIds } = workshopFields(section, editing);
  return (
    <>
      <StudioCreatorHeading id={section.id + '-title'}>
        {copy('heading')} {copy('accent', 'span', 'studio-hand')}
      </StudioCreatorHeading>
      <ol className={styles.steps} tabIndex={0} aria-labelledby={section.id + '-title'}>
        {itemIds.map((id, i) => (
          <li key={id}>
            <span className={styles.index} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            {copy(itemFieldId(id, 'title'), 'h3')}
          </li>
        ))}
      </ol>
    </>
  );
}
