import type { MarketingBlockProps } from '@/components/molecules/MarketingBlock/types';
import { workshopFields } from '@/components/molecules/WorkshopSection/fields';
import { WorkshopCheckoutAction } from '@/components/molecules/WorkshopCheckoutAction/WorkshopCheckoutAction';
import styles from './WorkshopOffer.module.css';

export function WorkshopOffer({ section, editing, preview, ticket }: MarketingBlockProps) {
  const { copy, value } = workshopFields(section, editing);
  return (
    <div className={styles.result}>
      <div className={styles.description}>
        <h2 className="studio-title" id={section.id + '-title'}>
          {copy('heading')} {copy('accent', 'span', 'studio-hand')}
        </h2>
        {copy('description', 'p')}
      </div>
      <article className={styles.card}>
        {copy('title', 'h3')}
        {copy('subtitle', 'p', styles.subtitle)}
        {(ticket || editing || value('price')) && (
          <p className={styles.price} data-site-locked={ticket ? '' : undefined}>
            {ticket ? (
              <>
                <strong>{ticket.price}</strong>
                <span>{ticket.currency}</span>
              </>
            ) : (
              <>
                {copy('price', 'strong')}
                {copy('currency')}
              </>
            )}
          </p>
        )}
        {copy('note', 'p', styles.note)}
        <WorkshopCheckoutAction ticket={ticket} editing={editing} preview={preview} />
      </article>
    </div>
  );
}
