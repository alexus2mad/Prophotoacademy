import { siteField, siteSection } from '../../fields';
import { studioAssets } from '@/lib/studio-design/assets';

export const studioHero = siteSection('hero', 'Перший екран фотостудії', [
  siteField('image', 'Фото', studioAssets.artifact.hero_space.src, 'image'),
  siteField(
    'image-alt',
    'Перший екран · Опис зображення',
    'Студія ProPhoto: циклорама, рожевий фон, світло і зона візажу',
  ),
  siteField('eyebrow', 'Надзаголовок', 'ProPhoto Studio'),
  siteField('emphasis', 'Акцент заголовка', 'простір, щоб'),
  siteField('title', 'Заголовок', 'Бачити більше'),
  siteField('book-action', 'Бронювання · Текст кнопки', 'Забронювати студію →'),
  siteField('rooms-action', 'Зали · Текст кнопки', 'Подивитись зали'),
]);
