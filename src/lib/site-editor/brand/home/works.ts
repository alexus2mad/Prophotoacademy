import { studioHomeWorks } from '@/lib/studio-home/selectors';
import { siteField, siteSection } from '../../fields';

export const homeWorks = siteSection('works', 'Роботи студентів', [
  siteField('title', 'Заголовок', 'Роботи'),
  siteField('emphasis', 'Акцент заголовка', '*студентів'),
  siteField('action', 'Текст кнопки', 'Хочу так само'),
  siteField('gallery-name', 'Галерея · Назва', 'Роботи студентів'),
  ...studioHomeWorks.flatMap((work, index) => {
    const label = 'Робота ' + (index + 1);
    return [
      siteField(work.id + '-image', label + ' · фото', work.image.src, 'image'),
      ...(work.mobileImage
        ? [
            siteField(
              work.id + '-mobile-image',
              label + ' · фото на телефоні',
              work.mobileImage.src,
              'image',
            ),
          ]
        : []),
      siteField(work.id + '-image-alt', label + ' · опис фото', work.alt),
    ];
  }),
]);
