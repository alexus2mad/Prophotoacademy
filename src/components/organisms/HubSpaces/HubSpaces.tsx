import { RoomCard } from '@/components/molecules/RoomCard/RoomCard';
import { findImage } from '@/lib/content/selectors';
import type { HubSpacesProps } from './types';
export function HubSpaces({ content }: HubSpacesProps) {
  return (
    <section className="container hub-spaces" id="spaces" aria-labelledby="spaces-title">
      <div className="section-heading">
        <h2 id="spaces-title">Оберіть свій простір</h2>
        <p className="muted">Базові тарифи · фінальна вартість у календарі</p>
      </div>
      <div className="room-grid">
        {content.rooms.map((room) => (
          <RoomCard key={room.id} room={room} image={findImage(content, room.imageId)} />
        ))}
      </div>
    </section>
  );
}
