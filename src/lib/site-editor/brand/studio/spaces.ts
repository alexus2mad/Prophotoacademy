import { studioAssets } from '@/lib/studio-design/assets';
import { siteField, siteSection } from '../../fields';

export const rooms = [
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
      {
        asset: studioAssets.studio.imgImgCyclo2,
        alt: 'Другий ракурс залу циклорами',
      },
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
      {
        asset: studioAssets.studio.imgImgContent3,
        alt: 'Камера для зйомки в контент залі',
      },
    ],
  },
  {
    id: 'makeup',
    title: 'Гримерна',
    description:
      'Чорний мармур, дзеркала з підсвіткою, зручні стільці. Місце для макіяжу, зачіски й підготовки до зйомки.',
    images: [
      {
        asset: studioAssets.studio.imgImgMakeup1,
        alt: 'Гримерна з дзеркалами та підсвіткою',
      },
      {
        asset: studioAssets.studio.imgImgMakeup3,
        alt: 'Робочі місця гримерної',
      },
    ],
  },
];

export const studioSpaces = siteSection('spaces', 'Зали та бронювання', [
  siteField('rooms-title', 'Зали · Заголовок', 'Три зали'),
  siteField('room-action', 'Зал · Текст кнопки', 'Забронювати →'),
  siteField('booking-title', 'Бронювання · Заголовок', 'Забронюйте'),
  siteField('booking-emphasis', 'Бронювання · Акцент заголовка', '*час'),
  siteField(
    'booking-intro',
    'Бронювання · Вступ',
    'Оберіть зал і зручний час. Адміністратор підтвердить бронювання та вартість.',
  ),
  siteField('room-label', 'Зал · Підпис', 'Зал'),
  siteField(
    'booking-help',
    'Бронювання · Пояснення',
    'Вільний час, тривалість і вартість оренди доступні в нашому сервісі бронювання.',
  ),
  siteField('booking-action', 'Бронювання · Текст кнопки', 'Обрати час і забронювати →'),
  ...rooms.flatMap((room) => [
    siteField(room.id + '-title', room.title + ' · назва', room.title),
    siteField(room.id + '-description', room.title + ' · опис', room.description, 'multiline'),
    ...room.images.flatMap((photo, i) => [
      siteField(
        room.id + '-image-' + i,
        room.title + ' · фото ' + (i + 1),
        photo.asset.src,
        'image',
      ),
      siteField(
        room.id + '-image-' + i + '-alt',
        room.title + ' · опис фото ' + (i + 1),
        photo.alt,
      ),
    ]),
  ]),
]);
