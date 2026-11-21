import { studioHomeDirections } from '@/lib/studio-home/selectors';
import { siteField, siteSection } from '../../fields';

export const homeDirections = siteSection('directions', 'Напрями навчання', [
  siteField('eyebrow', 'Надзаголовок', 'Академія'),
  siteField('title', 'Заголовок', 'Оберіть, як'),
  siteField('emphasis', 'Акцент заголовка', '*вчитися'),
  siteField('action', 'Текст кнопки', 'Вся академія'),
  ...studioHomeDirections({ programs: [] }).flatMap((card, index) => {
    const id = 'card-' + (index + 1);
    return [
      siteField(id + '-title', card.title + ' · назва', card.title),
      siteField(id + '-description', card.title + ' · опис', card.description ?? ''),
      siteField(id + '-action', card.title + ' · кнопка', card.action),
      siteField(id + '-image', card.title + ' · фото', card.image.src, 'image'),
      ...(card.mobileImage
        ? [
            siteField(
              id + '-mobile-image',
              card.title + ' · фото на телефоні',
              card.mobileImage.src,
              'image',
            ),
          ]
        : []),
    ];
  }),
]);
