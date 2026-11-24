import type { MarketingBlockProps } from '@/components/molecules/MarketingBlock/types';
import { workshopFields } from '@/components/molecules/WorkshopSection/fields';
import { WorkshopCheckoutAction } from '@/components/molecules/WorkshopCheckoutAction/WorkshopCheckoutAction';
import styles from './WorkshopIntro.module.css';

export function WorkshopIntro({ section, editing, preview, ticket }: MarketingBlockProps) {
  const { copy, value } = workshopFields(section, editing);
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
      {(ticket || editing || value('price')) && (
        <div className={styles.price} data-site-locked={ticket ? '' : undefined}>
          <p className="studio-label">Вартість</p>
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
        </div>
      )}
      <WorkshopCheckoutAction ticket={ticket} editing={editing} preview={preview} />
    </div>
  );
}
