import { studioSpaces, rooms } from '@/lib/site-editor/brand/studio/spaces';
import { bindSection } from '@/lib/site-editor/bind-section';
import { StudioSpacesGallery } from '@/components/organisms/StudioSpacesGallery/StudioSpacesGallery';
import { ecosystemDestinations } from '@/lib/ecosystem';
import type { StudioSpaceSectionsProps } from './types';
import styles from './StudioSpaceSections.module.css';

export function StudioSpaceSections({ page, address }: StudioSpaceSectionsProps) {
  const { text, image } = bindSection(page, studioSpaces);
  const bookingUrl = ecosystemDestinations.studioBooking;
  return (
    <>
      <section
        id="spaces"
        aria-labelledby="studio-spaces-title"
        className={`${styles.spaces} studio-band studio-dark`}
      >
        <div className="studio-wrap">
          <h2 className="studio-title" id="studio-spaces-title">
            {text('rooms-title')}
          </h2>
          {rooms.map((room) => (
            <article
              id={room.id}
              aria-labelledby={`${room.id}-title`}
              className={styles.room}
              key={room.id}
            >
              <div className={styles.roomCopy}>
                <h3 id={`${room.id}-title`}>{text(room.id + '-title')}</h3>
                <p>{text(room.id + '-description')}</p>
                <a className={`${styles.roomAction} studio-button`} href={bookingUrl}>
                  {text('room-action')}
                </a>
              </div>
              <StudioSpacesGallery
                images={room.images.map((photo, i) => ({
                  asset: image(room.id + '-image-' + i, photo.asset),
                  alt: text(room.id + '-image-' + i + '-alt'),
                }))}
                label={`Фотографії: ${text(room.id + '-title')}`}
              />
            </article>
          ))}
        </div>
      </section>
      <section
        id="studio-booking"
        aria-labelledby="studio-booking-title"
        className="studio-band studio-light"
      >
        <div className={`${styles.bookingGrid} studio-wrap`}>
          <div>
            <h2 className="studio-title" id="studio-booking-title">
              {text('booking-title')}
              <br />
              <span className="studio-hand">{text('booking-emphasis')}</span>
            </h2>
            <p className="studio-lead">{text('booking-intro')}</p>
          </div>
          <div className={styles.bookingDestination}>
            <p className="studio-label studio-eyebrow">{text('room-label')}</p>
            <ul>
              {rooms.map((room) => (
                <li key={room.id}>
                  <a href={bookingUrl}>{text(room.id + '-title')}</a>
                </li>
              ))}
            </ul>
            <p>{text('booking-help')}</p>
            <a href={bookingUrl} className="studio-button">
              {text('booking-action')}
            </a>
            <p className={styles.address}>{address}</p>
          </div>
        </div>
      </section>
    </>
  );
}
