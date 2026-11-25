import { WorkshopCheckoutAction } from '@/components/molecules/WorkshopCheckoutAction/WorkshopCheckoutAction';
import { FragmentLink } from '@/components/atoms/FragmentLink/FragmentLink';
import { workshopTicketCardId } from '@/lib/site-editor/intensive';
import type { WorkshopTicketPricesProps } from './types';
import styles from './WorkshopTicketPrices.module.css';

export function WorkshopTicketPrices({
  ticket,
  editing,
  id,
  linkToOffer,
}: WorkshopTicketPricesProps) {
  return (
    <div
      id={id}
      tabIndex={id ? -1 : undefined}
      className={styles.prices}
      role="group"
      aria-label="Формати участі"
    >
      {ticket.options.map((option) => {
        const label =
          option.label +
          ', ' +
          option.price +
          ' ' +
          ticket.currency +
          (option.previousPrice ? ' замість ' + option.previousPrice : '');
        const content = (
          <>
            <span className={styles.label}>
              {option.label}
              {option.previousPrice && <s>{option.previousPrice.replace(/\s/g, '')}</s>}
            </span>
            <span className={styles.price}>
              <strong>{option.price}</strong>
              <sup>{ticket.currency}</sup>
            </span>
          </>
        );
        return linkToOffer && !editing ? (
          <FragmentLink
            key={option.id}
            targetId={workshopTicketCardId(option.id)}
            className={styles.card}
            aria-label={label + ' — до картки участі'}
            data-site-locked=""
          >
            {content}
          </FragmentLink>
        ) : (
          <WorkshopCheckoutAction
            key={option.id}
            option={option}
            editing={editing}
            className={styles.card}
            label={label + (!linkToOffer && option.href ? ' — записатися' : '')}
          >
            {content}
          </WorkshopCheckoutAction>
        );
      })}
    </div>
  );
}
