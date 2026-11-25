import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { FragmentLink } from '@/components/atoms/FragmentLink/FragmentLink';
import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
import { StudioMobileAction } from '@/components/molecules/StudioMobileAction/StudioMobileAction';
import { StudioRentalBanner } from '@/components/organisms/StudioRentalBanner/StudioRentalBanner';
import { WorkshopCheckoutAction } from '@/components/molecules/WorkshopCheckoutAction/WorkshopCheckoutAction';
import { WorkshopTicketPrices } from '@/components/molecules/WorkshopTicketPrices/WorkshopTicketPrices';
import { readField } from '@/lib/site-editor/fields';
import {
  hasWorkshopAnnouncement,
  workshopTicketOfferId,
  workshopTicketsId,
} from '@/lib/site-editor/intensive';
import type { WorkshopIntensiveTemplateProps } from './types';
import hero from '@/components/organisms/StudioCreatorHero/StudioCreatorHero.module.css';
import styles from './WorkshopIntensiveTemplate.module.css';

export function WorkshopIntensiveTemplate({ page, ticket }: WorkshopIntensiveTemplateProps) {
  const cover = (key: string) => readField(page, 'landing-cover', key);
  const program = page.sections.find((section) => section.blockType === 'intensive-program');
  const action = <WorkshopCheckoutAction ticket={ticket} editing={page.editorPreview} />;
  // Several tickets are chosen on their price cards; one ticket keeps a single action.
  const formats = ticket && ticket.options.length > 1 ? ticket : undefined;
  // The announcement block shows the prices after the cover; the cover then leads to it.
  const announced = hasWorkshopAnnouncement(page.sections);
  const offer = workshopTicketOfferId(page.sections, ticket);
  const choose = (
    <FragmentLink className="studio-button" targetId={workshopTicketsId}>
      {offer ? 'Обрати пакет' : 'Обрати формат'} <span aria-hidden="true">→</span>
    </FragmentLink>
  );
  return (
    <article className={styles.page}>
      <MarketingSlot page={page} id="landing-cover" ticket={ticket} />
      <section
        className={`${hero.hero} studio-dark`}
        data-editorial-hero=""
        data-header-tone="dark"
        data-site-section="landing-cover"
        aria-labelledby="workshop-title"
      >
        {cover('image') && (
          <StudioImage
            asset={{ src: cover('image'), width: 1600, height: 2400 }}
            fieldId="image"
            alt={cover('alt')}
            className={hero.photo}
            position="50% 30%"
            fit="cover"
            sizes="100vw"
            preload
          />
        )}
        <div className={`${hero.copy} studio-wrap`}>
          <h1 id="workshop-title">
            <span className={hero.hand} data-site-field="accent">
              {cover('accent')}
            </span>
            <span className={`${hero.title} ${styles.title}`} data-site-field="title">
              {cover('title') || page.title}
            </span>
          </h1>
          <p className={hero.subject} data-site-field="description">
            {cover('description')}
          </p>
          <div className={`${hero.facts} ${styles.facts}`} data-site-field="facts">
            {cover('facts')
              .split('\n')
              .filter(Boolean)
              .map((fact, index) => (
                <span key={index}>{fact}</span>
              ))}
          </div>
          {formats && !announced && (
            <div data-site-locked="">
              <WorkshopTicketPrices
                id={offer ? undefined : workshopTicketsId}
                linkToOffer={Boolean(offer)}
                ticket={formats}
                editing={page.editorPreview}
              />
            </div>
          )}
          <div className="studio-actions" data-site-locked="">
            {formats && (announced || offer) && <div className={hero.desktopAction}>{choose}</div>}
            {!formats && <div className={hero.desktopAction}>{action}</div>}
            {program && (
              <FragmentLink className="studio-button-outline" targetId={program.id}>
                Програма
              </FragmentLink>
            )}
          </div>
        </div>
      </section>
      <MarketingComposition page={page} ticket={ticket} />
      <StudioRentalBanner />
      {formats
        ? (offer || announced || formats.options.some((option) => option.href)) && (
            <StudioMobileAction>{choose}</StudioMobileAction>
          )
        : ticket?.href && <StudioMobileAction>{action}</StudioMobileAction>}
    </article>
  );
}
