import { StudioSpacesGallery } from '@/components/organisms/StudioSpacesGallery/StudioSpacesGallery';
import { ecosystemDestinations } from '@/lib/ecosystem';
import { studioAssets } from '@/lib/studio-design/assets';
import type { StudioSpaceSectionsProps } from './types';
import styles from './StudioSpaceSections.module.css';

const rooms = [
  {
    id: 'cyclorama',
    title: 'Циклорама',
    description:
      'Світлий зал із білою підлогою, цегляними стінами, зоною відпочинку та робочим місцем. Для портретних, предметних і рекламних зйомок.',
    images: [
      {
        asset: studioAssets.studio.imgImgCyclo1,
        alt: 'Світлий зал циклорами, зона відпочинку й обладнання',
      },
      { asset: studioAssets.studio.imgImgCyclo2, alt: 'Другий ракурс залу циклорами' },
    ],
  },
  {
    id: 'content-room',
    title: 'Контент зал',
    description:
      'Темний зал з акустичними панелями, столом і мікрофонами. Для подкастів, інтервʼю та експертних відео.',
    images: [
      {
        asset: studioAssets.studio.imgImgContent1,
        alt: 'Темний контент зал з професійним освітленням',
      },
      { asset: studioAssets.studio.imgImgContent3, alt: 'Камера для зйомки в контент залі' },
    ],
  },
  {
    id: 'makeup',
    title: 'Гримерна',
    description:
      'Чорний мармур, дзеркала з підсвіткою, зручні стільці. Місце для макіяжу, зачіски й підготовки до зйомки.',
    images: [
      { asset: studioAssets.studio.imgImgMakeup1, alt: 'Гримерна з дзеркалами та підсвіткою' },
      { asset: studioAssets.studio.imgImgMakeup3, alt: 'Робочі місця гримерної' },
    ],
  },
];

export function StudioSpaceSections({ address }: StudioSpaceSectionsProps) {
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
            Три зали
          </h2>
          {rooms.map((room) => (
            <article
              id={room.id}
              aria-labelledby={`${room.id}-title`}
              className={styles.room}
              key={room.id}
            >
              <div className={styles.roomCopy}>
                <h3 id={`${room.id}-title`}>{room.title}</h3>
                <p>{room.description}</p>
                <a className={`${styles.roomAction} studio-button`} href={bookingUrl}>
                  Забронювати →
                </a>
              </div>
              <StudioSpacesGallery images={room.images} label={`Фотографії: ${room.title}`} />
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
              Забронюйте
              <br />
              <span className="studio-hand">*час</span>
            </h2>
            <p className="studio-lead">
              Оберіть зал і зручний час. Адміністратор підтвердить бронювання та вартість.
            </p>
          </div>
          <div className={styles.bookingDestination}>
            <p className="studio-label studio-eyebrow">Зал</p>
            <ul>
              {rooms.map((room) => (
                <li key={room.id}>
                  <a href={bookingUrl}>{room.title}</a>
                </li>
              ))}
            </ul>
            <p>Вільний час, тривалість і вартість оренди доступні в нашому сервісі бронювання.</p>
            <a href={bookingUrl} className="studio-button">
              Обрати час і забронювати →
            </a>
            <p className={styles.address}>{address}</p>
          </div>
        </div>
      </section>
    </>
  );
}
