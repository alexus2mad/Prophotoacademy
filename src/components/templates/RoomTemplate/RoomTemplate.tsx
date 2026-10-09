import { Photo } from '@/components/atoms/Photo/Photo';
import { findImage } from '@/lib/content/selectors';
import { siteHref } from '@/lib/ecosystem';
import { money } from '@/lib/format';
import Link from 'next/link';
import type { RoomTemplateProps } from './types';
export function RoomTemplate({ room, content }: RoomTemplateProps) {
  return (
    <div className="container hub-detail">
      <section className="hub-detail-opening">
        <div>
          <Link className="breadcrumb" href={siteHref('hub', '#spaces')}>
            Усі простори
          </Link>
          <h1>{room.title}</h1>
          <p className="lead">{room.description}</p>
          <p className="room-detail-price">
            {money(room.pricePerHour)} <span>/ год</span>
          </p>
          <p className="muted">
            {room.area ? `${room.area} м² · ` : ''}Від {room.minimumMinutes} хв
          </p>
          <Link className="button" href={siteHref('hub', `booking?room=${room.bookingKey}`)}>
            Перевірити вільний час
          </Link>
          {room.equipmentNote && <p className="equipment-note">{room.equipmentNote}</p>}
        </div>
        <figure>
          <Photo image={findImage(content, room.imageId)} priority />
        </figure>
      </section>
      <section className="room-detail-body">
        <div>
          <h2>Для вашого формату</h2>
          <ul className="room-features">
            {room.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <p className="muted">
            Остаточна вартість залежить від часу та тривалості. Тариф і доступність показує календар
            бронювання.
          </p>
        </div>
        <div>
          <h2>Як нас знайти</h2>
          <p>
            {content.hub.address}
            <br />
            {content.hub.arrival}
          </p>
          <a href={content.hub.mapsUrl} className="text-link" target="_blank" rel="noreferrer">
            Прокласти маршрут
          </a>
        </div>
      </section>
      {room.galleryImageIds
        .filter((id) => id !== room.imageId)
        .map((id) => (
          <figure className="room-extra-photo" key={id}>
            <Photo image={findImage(content, id)} natural />
            <figcaption>{findImage(content, id).credit}</figcaption>
          </figure>
        ))}
    </div>
  );
}
