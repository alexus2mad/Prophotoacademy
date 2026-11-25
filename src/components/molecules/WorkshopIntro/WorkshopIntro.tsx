import type { MarketingBlockProps } from '@/components/molecules/MarketingBlock/types';
import { workshopFields } from '@/components/molecules/WorkshopSection/fields';
import { WorkshopCheckoutAction } from '@/components/molecules/WorkshopCheckoutAction/WorkshopCheckoutAction';
import styles from './WorkshopIntro.module.css';

export function WorkshopIntro({
  section,
  editing,
  preview,
  ticket,
  ticketAnnounced,
}: MarketingBlockProps) {
  const { copy, value } = workshopFields(section, editing);
  const formats = ticket && ticket.options.length > 1 ? ticket.options : undefined;
  const facts = value('facts')
    .split('\n')
    .filter((fact) => fact.trim());
  return (
    <div className={styles.intro}>
      <h2 id={section.id + '-title'}>
        {copy('heading')} {copy('accent', 'span', 'studio-hand')}
      </h2>
      {copy('description', 'p', styles.description)}
      {copy('invitation', 'p', styles.invitation)}
      {copy(
        'facts',
        'div',
        styles.facts,
        facts.map((fact, i) => <span key={i}>{fact}</span>),
      )}
      {!ticketAnnounced && (ticket || editing || value('price')) && (
        <div className={styles.price} data-site-locked={ticket ? '' : undefined}>
          <p className="studio-label">Вартість</p>
          {formats ? (
            <ul className={styles.formats}>
              {formats.map((option) => (
                <li key={option.id}>
                  <span>{option.label}</span>
                  {option.previousPrice && <s>{option.previousPrice}</s>}
                  <strong>{option.price}</strong>
                  <span>{ticket?.currency}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>
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
        </div>
      )}
      {formats ? (
        <a className="studio-button" href="#workshop-tickets" data-site-locked="">
          Обрати формат <span aria-hidden="true">→</span>
        </a>
      ) : (
        <WorkshopCheckoutAction ticket={ticket} editing={editing} preview={preview} />
      )}
    </div>
  );
}
