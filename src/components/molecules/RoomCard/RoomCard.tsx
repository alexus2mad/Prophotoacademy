import { Photo } from '@/components/atoms/Photo/Photo';
import { siteHref } from '@/lib/ecosystem';
import { money } from '@/lib/format';
import Link from 'next/link';
import type { RoomCardProps } from './types';
export function RoomCard({ room, image }: RoomCardProps) {
  return (
    <article className="room-card" key={room.id}>
      <Link
        href={siteHref('hub', room.slug)}
        className="room-photo"
        aria-label={`Переглянути ${room.title}`}
      >
        <Photo image={image} sizes="(max-width:767px) 100vw,33vw" />
      </Link>
      <div className="room-heading">
        <Link href={siteHref('hub', room.slug)}>
          <h3>{room.title}</h3>
        </Link>
        <span>
          {money(room.pricePerHour)}
          <small> / год</small>
        </span>
      </div>
      <p>
        {room.area ? `${room.area} м² · ` : ''}
        {room.features.slice(0, 2).join(' · ')}
      </p>
      <Link
        href={siteHref('hub', `booking?room=${room.bookingKey}`)}
        className="button button-secondary button-small"
      >
        Обрати час
      </Link>
    </article>
  );
}
