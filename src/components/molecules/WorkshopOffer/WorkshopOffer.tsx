import type { MarketingBlockProps } from '@/components/molecules/MarketingBlock/types';
import { workshopFields } from '@/components/molecules/WorkshopSection/fields';
import { WorkshopCheckoutAction } from '@/components/molecules/WorkshopCheckoutAction/WorkshopCheckoutAction';
import { workshopTicketCardId, workshopTicketsId } from '@/lib/site-editor/intensive';
import styles from './WorkshopOffer.module.css';

export function WorkshopOffer({
  section,
  editing,
  preview,
  ticket,
  ticketOfferId,
}: MarketingBlockProps) {
  const { copy, value } = workshopFields(section, editing);
  const anchor = ticketOfferId === section.id;
  if (ticket && ticket.options.length > 1)
    return (
      <div className={styles.result} data-formats="">
        <div className={styles.description}>
          <h2 className="studio-title" id={section.id + '-title'}>
            {copy('heading')} {copy('accent', 'span', 'studio-hand')}
          </h2>
          {copy('description', 'p')}
        </div>
        <div
          className={styles.cards}
          id={anchor ? workshopTicketsId : undefined}
          tabIndex={anchor ? -1 : undefined}
          role="group"
          aria-label="Квитки на інтенсив"
          data-site-locked=""
        >
          {ticket.options.map((option) => (
            <article
              key={option.id}
              className={styles.card}
              id={anchor ? workshopTicketCardId(option.id) : undefined}
              tabIndex={anchor ? -1 : undefined}
            >
              <h3>{option.label}</h3>
              {option.description && <p className={styles.subtitle}>{option.description}</p>}
              {option.includes.length > 0 && (
                <ul className={styles.includes}>
                  {option.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
              <p className={styles.price}>
                {option.previousPrice && (
                  <s aria-label={'Була ціна ' + option.previousPrice + ' ' + ticket.currency}>
                    {option.previousPrice}
                  </s>
                )}
                <strong>{option.price}</strong>
                <span>{ticket.currency}</span>
              </p>
              <WorkshopCheckoutAction option={option} editing={editing} preview={preview} />
            </article>
          ))}
        </div>
        {copy('note', 'p', styles.formatsNote)}
      </div>
    );
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
