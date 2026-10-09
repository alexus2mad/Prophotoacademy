import { Photo } from '@/components/atoms/Photo/Photo';
import { findImage } from '@/lib/content/selectors';
import { siteHref } from '@/lib/ecosystem';
import { money } from '@/lib/format';
import Link from 'next/link';
import type { HubHeroProps } from './types';
export function HubHero({ content, hub }: HubHeroProps) {
  return (
    <section className="hub-opening container">
      <div className="hub-opening-copy">
        <p className="eyebrow">Фотостудія · Київ</p>
        <h1>{hub.heroTitle}</h1>
        <p className="lead">{hub.heroDescription}</p>
        <div className="hub-opening-rates" aria-label="Простори та базові тарифи">
          {content.rooms.map((room) => (
            <Link key={room.id} href={siteHref('hub', `booking?room=${room.bookingKey}`)}>
              <span>{room.title}</span>
              <span>
                {money(room.pricePerHour)} <small>/ год</small>
              </span>
            </Link>
          ))}
        </div>
        <div className="hub-location">
          <a href={hub.mapsUrl} target="_blank" rel="noreferrer">
            {hub.address}
          </a>
          <span>{hub.hours}</span>
        </div>
        <Link href={siteHref('hub', 'booking')} className="button">
          Перевірити вільний час
        </Link>
      </div>
      <figure className="hub-opening-photo">
        <Photo image={findImage(content, hub.heroImageId)} priority />
      </figure>
    </section>
  );
}
