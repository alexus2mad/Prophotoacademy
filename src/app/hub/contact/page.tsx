import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { canonicalUrl } from '@/lib/ecosystem';
import { phoneLabel } from '@/lib/format';
export const metadata: Metadata = {
  title: 'Контакти студії',
  alternates: { canonical: canonicalUrl('hub', 'contact') },
};
export default async function HubContact() {
  const { hub } = await getContent();
  return (
    <div className="container hub-contact">
      <h1>До зустрічі в студії</h1>
      <div className="hub-contact-grid">
        <div>
          <h2>ProPhoto Hub</h2>
          <p>
            {hub.address}
            <br />
            {hub.arrival}
          </p>
          <p>{hub.hours}</p>
          <a
            href={hub.mapsUrl}
            className="button button-secondary"
            target="_blank"
            rel="noreferrer"
          >
            Прокласти маршрут
          </a>
        </div>
        <div>
          <h2>Поговорімо про зйомку</h2>
          <a className="contact-large" href={`tel:${hub.phone}`}>
            {phoneLabel(hub.phone)}
          </a>
          <a className="text-link" href={`mailto:${hub.email}`}>
            {hub.email}
          </a>
          <a className="text-link" href={hub.instagram} target="_blank" rel="noreferrer">
            Instagram студії
          </a>
        </div>
      </div>
    </div>
  );
}
