import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { StudioContactDetail } from '@/components/molecules/StudioContactDetail/StudioContactDetail';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { StudioMobileAction } from '@/components/molecules/StudioMobileAction/StudioMobileAction';
import { StudioInquiryForm } from '@/components/organisms/StudioInquiryForm/StudioInquiryForm';
import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
import { phoneLabel } from '@/lib/format';
import type { StudioContactsTemplateProps } from './types';
import styles from './StudioContactsTemplate.module.css';

export function StudioContactsTemplate({ settings, intro, page }: StudioContactsTemplateProps) {
  return (
    <>
      <MarketingSlot page={page} id="intro" />
      <section data-site-section="intro" className={`studio-light studio-wrap ${styles.page}`}>
        <p data-site-field="label" className="studio-label studio-eyebrow">
          {intro?.label ?? 'Контакти ProPhoto Academy'}
        </p>
        <h1>
          <span data-site-field="accent">{intro?.accent ?? '*пишіть, телефонуйте'}</span>
          <SiteCopy id="title">{intro?.title ?? 'Будемо раді'}</SiteCopy>
        </h1>
        <MarketingSlot page={page} id="contacts" />
        <div className={styles.columns}>
          <div>
            <dl data-site-section="contacts">
              <StudioContactDetail
                label="Телефон"
                value={phoneLabel(settings.phone)}
                href={`tel:${settings.phone}`}
              />
              <StudioContactDetail
                label="Пошта"
                value={settings.email}
                href={`mailto:${settings.email}`}
              />
              <StudioContactDetail fieldId="address" label="Адреса" value={settings.address} />
            </dl>
            <div className={styles.socials} data-site-locked="">
              <p className="studio-label studio-eyebrow">Соцмережі</p>
              <nav aria-label="Соціальні мережі академії">
                <a href={settings.instagram}>Instagram</a>
                <a href={settings.telegram}>Telegram</a>
                <a href={settings.youtube}>YouTube</a>
              </nav>
            </div>
          </div>
          <div className={styles.form} data-site-locked="">
            <p className="studio-label studio-eyebrow">Безкоштовна консультація</p>
            <StudioInquiryForm id="studio-contacts" compact />
          </div>
        </div>
        <StudioMobileAction>
          <InquiryButton className="studio-button">Залишити заявку →</InquiryButton>
        </StudioMobileAction>
      </section>
    </>
  );
}
