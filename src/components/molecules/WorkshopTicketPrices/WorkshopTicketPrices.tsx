import { WorkshopCheckoutAction } from '@/components/molecules/WorkshopCheckoutAction/WorkshopCheckoutAction';
import type { WorkshopTicketPricesProps } from './types';
import styles from './WorkshopTicketPrices.module.css';

/** Cover price cards: one per ticket, each starting its own checkout. */
export function WorkshopTicketPrices({ ticket, editing, id }: WorkshopTicketPricesProps) {
  return (
    <div id={id} className={styles.prices} role="group" aria-label="Формати участі">
      {ticket.options.map((option) => (
        <WorkshopCheckoutAction
          key={option.id}
          option={option}
          editing={editing}
          className={styles.card}
          label={
            option.label +
            ', ' +
            option.price +
            ' ' +
            ticket.currency +
            (option.previousPrice ? ' замість ' + option.previousPrice : '') +
            (option.href ? ' — записатися' : '')
          }
        >
          <span className={styles.label}>
            {option.label.toLocaleLowerCase('uk')}
            {option.previousPrice && <s>{option.previousPrice.replace(/\s/g, '')}</s>}
          </span>
          <span className={styles.price}>
            <strong>{option.price}</strong>
            <sup>{ticket.currency}</sup>
          </span>
        </WorkshopCheckoutAction>
      ))}
    </div>
  );
}
