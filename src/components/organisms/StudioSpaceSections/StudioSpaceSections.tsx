import { SiteCopy } from '@/components/atoms/SiteCopy/SiteCopy';
import { MarketingSlot } from '@/components/molecules/MarketingSlot/MarketingSlot';
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
      <MarketingSlot page={page} id="spaces" />
      <section
        id="spaces"
        data-site-section="spaces"
        aria-labelledby="studio-spaces-title"
        className={`${styles.spaces} studio-band studio-dark`}
      >
        <div className="studio-wrap">
          <h2 data-site-field="rooms-title" className="studio-title" id="studio-spaces-title">
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
                <h3 data-site-field={room.id + '-title'} id={`${room.id}-title`}>
                  {text(room.id + '-title')}
                </h3>
                <p data-site-field={room.id + '-description'}>{text(room.id + '-description')}</p>
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
      <MarketingSlot page={page} id="booking" />
      <section
        id="studio-booking"
        data-site-section="spaces"
        aria-labelledby="studio-booking-title"
        className="studio-band studio-light"
      >
        <div className={`${styles.bookingGrid} studio-wrap`}>
          <div>
            <h2 className="studio-title" id="studio-booking-title">
              <SiteCopy id="booking-title">{text('booking-title')}</SiteCopy>
              <br />
              <span data-site-field="booking-emphasis" className="studio-hand">
                {text('booking-emphasis')}
              </span>
            </h2>
            <p data-site-field="booking-intro" className="studio-lead">
              {text('booking-intro')}
            </p>
          </div>
          <div className={styles.bookingDestination}>
            <p data-site-field="room-label" className="studio-label studio-eyebrow">
              {text('room-label')}
            </p>
            <ul>
              {rooms.map((room) => (
                <li key={room.id}>
                  <a data-site-field={room.id + '-title'} href={bookingUrl}>
                    {text(room.id + '-title')}
                  </a>
                </li>
              ))}
            </ul>
            <p data-site-field="booking-help">{text('booking-help')}</p>
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
