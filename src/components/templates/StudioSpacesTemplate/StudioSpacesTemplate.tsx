import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioSpacesGallery } from '@/components/organisms/StudioSpacesGallery/StudioSpacesGallery';
import { studioAssets } from '@/lib/studio-design/assets';
import type { StudioSpacesTemplateProps } from './types';
import styles from './StudioSpacesTemplate.module.css';

export function StudioSpacesTemplate({ content }: StudioSpacesTemplateProps) {
  const bookingUrl = content.hub.bookingUrl;
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
  return (
    <>
      <section className={`${styles.hero} studio-dark`}>
        <StudioImage
          asset={studioAssets.studio.imgHero}
          alt="Портрет рудоволосої моделі у студійному світлі"
          className={styles.heroImage}
          fit="cover"
          sizes="100vw"
          preload
        />
        <div className="studio-wrap">
          <p className="studio-label">ProPhoto Studio</p>
          <h1>
            <span>
              <i>*</i>простір, щоб
            </span>
            Бачити більше
          </h1>
          <div className="studio-actions">
            <a className="studio-button" href={bookingUrl}>
              Забронювати студію →
            </a>
            <a className="studio-button-outline" href="#spaces">
              Подивитись зали
            </a>
          </div>
        </div>
      </section>
      <section id="spaces" className={`${styles.spaces} studio-band studio-dark`}>
        <div className="studio-wrap">
          <h2 className="studio-title">Три зали</h2>
          <div className={styles.rooms}>
            {rooms.map((room) => (
              <article id={room.id} className={styles.room} key={room.id}>
                <div className={styles.roomCopy}>
                  <h3>{room.title}</h3>
                  <p>{room.description}</p>
                  <a className="studio-button" href={bookingUrl}>
                    Забронювати →
                  </a>
                </div>
                <StudioSpacesGallery images={room.images} label={`Фотографії: ${room.title}`} />
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="studio-booking" className={`${styles.booking} studio-band studio-form-red`}>
        <div className={`${styles.bookingGrid} studio-wrap`}>
          <div>
            <h2 className="studio-title">
              Забронюйте
              <br />
              <span className="studio-hand">*час</span>
            </h2>
            <p className="studio-lead">
              Оберіть зал і зручний час. Адміністратор підтвердить бронювання та вартість.
            </p>
          </div>
          <div className={styles.bookingDestination}>
            <p className="studio-label">Зал</p>
            <ul>
              {rooms.map((room) => (
                <li key={room.id}>
                  <a href={bookingUrl}>{room.title}</a>
                </li>
              ))}
            </ul>
            <p>Вільний час, тривалість і вартість оренди доступні в нашому сервісі бронювання.</p>
            <a href={bookingUrl} className="studio-button-inverse">
              Обрати час і забронювати →
            </a>
            <p className={styles.address}>{content.hub.address}</p>
          </div>
        </div>
      </section>
    </>
  );
}
