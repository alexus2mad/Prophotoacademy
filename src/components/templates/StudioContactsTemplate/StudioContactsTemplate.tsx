import { StudioContactDetail } from '@/components/molecules/StudioContactDetail/StudioContactDetail';
import { StudioInquiryForm } from '@/components/organisms/StudioInquiryForm/StudioInquiryForm';
import { phoneLabel } from '@/lib/format';
import type { StudioContactsTemplateProps } from './types';
import styles from './StudioContactsTemplate.module.css';

export function StudioContactsTemplate({ settings }: StudioContactsTemplateProps) {
  return (
    <section className={`studio-light studio-wrap ${styles.page}`}>
      <p className="studio-label studio-eyebrow">Контакти</p>
      <h1>
        <span>*пишіть, телефонуйте</span>Будемо раді
      </h1>
      <div className={styles.columns}>
        <div>
          <dl>
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
            <StudioContactDetail label="Адреса" value={settings.address} />
          </dl>
          <div className={styles.socials}>
            <p className="studio-label studio-eyebrow">Соцмережі</p>
            <nav aria-label="Соціальні мережі академії">
              <a href={settings.instagram}>Instagram</a>
              <a href={settings.telegram}>Telegram</a>
              <a href={settings.youtube}>YouTube</a>
            </nav>
          </div>
        </div>
        <div className={styles.form}>
          <p className="studio-label studio-eyebrow">Безкоштовна консультація</p>
          <StudioInquiryForm id="studio-contacts" compact />
        </div>
      </div>
    </section>
  );
}
