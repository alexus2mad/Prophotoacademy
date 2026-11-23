import { phoneLabel } from '@/lib/format';
import type { SiteRouteProps } from '@/lib/site-editor/types';
import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
import { MarketingComposition } from '@/components/molecules/MarketingComposition/MarketingComposition';
import { readSitePage } from '@/lib/site-editor/public';
import { contactContent } from '@/lib/site-editor/support-pages';
import { getContent } from '@/lib/content';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { StudioContactsTemplate } from '@/components/templates/StudioContactsTemplate/StudioContactsTemplate';
import { academyDesign } from '@/lib/studio-design/variant';
import { academyMetadata } from '@/lib/seo/metadata';
export const metadata = academyMetadata('/contacts', {
  title: 'Контакти фотошколи в Києві',
  description:
    'Телефон, email та адреса ProPhoto Academy у Києві. Зв’яжіться з академією, щоб обрати курс фотографії або уточнити формат навчання.',
});
export default async function Contacts({ searchParams }: SiteRouteProps) {
  const [content, page] = await Promise.all([
    getContent(),
    readSitePage('/contacts', searchParams),
  ]);
  const { settings, intro } = contactContent(content, page);
  if (academyDesign() === 'studio')
    return (
      <>
        <StudioContactsTemplate page={page} settings={settings} intro={intro} />
        <MarketingComposition page={page} />
      </>
    );
  return (
    <>
      <div className="container">
        <MarketingSlot page={page} id="intro" />
        <div className="page-heading">
          <h1>Контакти</h1>
          <p className="lead muted">
            Потрібна допомога з курсом або особливий формат навчання? Зв’яжіться з академією.
          </p>
        </div>
        <MarketingSlot page={page} id="contacts" />
        <div className="contact-grid">
          <div className="contact-details">
            <div>
              <h2>Телефон</h2>
              <a href={`tel:${settings.phone}`}>{phoneLabel(settings.phone)}</a>
            </div>
            <div>
              <h2>Email</h2>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
            <div>
              <h2>Академія у Києві</h2>
              <p>{settings.address}</p>
            </div>
          </div>
          <div className="enrollment-panel">
            <h2>Розкажіть про свою мету</h2>
            <p className="muted">
              Знайдемо програму й найближчий набір або підготуємо індивідуальний формат.
            </p>
            <InquiryButton className="button button-wide">Залишити заявку</InquiryButton>
            <a href={settings.telegram} className="panel-link">
              Telegram академії
            </a>
          </div>
        </div>
      </div>
      <MarketingComposition page={page} />
    </>
  );
}
