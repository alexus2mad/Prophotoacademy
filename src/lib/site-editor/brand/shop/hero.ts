import { siteField, siteSection } from '../../fields';
import { studioAssets } from '@/lib/studio-design/assets';

export const shopHero = siteSection('hero', 'Перший екран магазину', [
  siteField('image', 'Фото', studioAssets.shop.imgHero.src, 'image'),
  siteField(
    'image-alt',
    'Перший екран · Опис зображення',
    'Студійний портрет моделі крупним планом',
  ),
  siteField('eyebrow', 'Надзаголовок', 'ProPhoto Shop'),
  siteField('emphasis', 'Акцент заголовка', 'техніка, щоб'),
  siteField('title', 'Заголовок', 'Бачити більше'),
  siteField('shop-action', 'Магазин · Текст кнопки', 'Підібрати техніку →'),
]);
