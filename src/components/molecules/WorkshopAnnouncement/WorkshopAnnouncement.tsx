import type { MarketingBlockProps } from '@/components/molecules/MarketingBlock/types';
import { workshopFields } from '@/components/molecules/WorkshopSection/fields';
import { WorkshopTicketPrices } from '@/components/molecules/WorkshopTicketPrices/WorkshopTicketPrices';
import styles from './WorkshopAnnouncement.module.css';

/** AI Artwork's announcement layout for editor workshops, with the bound ticket prices. */
export function WorkshopAnnouncement({ section, editing, preview, ticket }: MarketingBlockProps) {
  const { copy, value } = workshopFields(section, editing);
  const when = value('when')
    .split('\n')
    .filter((line) => line.trim());
  return (
    <div className={styles.announcement}>
      {copy('eyebrow', 'p', 'studio-label studio-eyebrow')}
      <h2 id={section.id + '-title'}>{copy('heading')}</h2>
      {copy('description', 'p', styles.subtitle)}
      {(when.length > 0 || editing) &&
        copy(
          'when',
          'p',
          styles.when,
          when.map((line, index) => <span key={index}>{line}</span>),
        )}
      {ticket ? (
        <WorkshopTicketPrices id="workshop-tickets" ticket={ticket} editing={editing || preview} />
      ) : (
        editing && (
          <p className={styles.missing} data-site-locked="">
            Ціни з’являться після вибору квитка на першому екрані
          </p>
        )
      )}
      {copy('practice', 'p', styles.practice)}
    </div>
  );
}
