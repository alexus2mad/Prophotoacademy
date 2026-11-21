import { studioAssets } from '@/lib/studio-design/assets';
import { siteField, siteSection } from '../../fields';

export const homeBanners = siteSection('banners', 'Магазин і фотостудія', [
  siteField(
    'shop-description',
    'Магазин · Опис',
    'Уся необхідна техніка для зйомки. Допоможемо підібрати під ваші задачі й бюджет.',
  ),
  siteField('shop-label', 'Магазин · надзаголовок', 'Магазин екосистеми'),
  siteField('shop-action', 'Магазин · кнопка', 'До магазину'),
  siteField('shop-image', 'Магазин · фото', studioAssets.home.imgImgHome144015.src, 'image'),
  siteField(
    'shop-mobile-image',
    'Магазин · фото на телефоні',
    studioAssets.homeMobile.imgImgHome39014.src,
    'image',
  ),
  siteField(
    'shop-image-alt',
    'Магазин · опис зображення',
    'Парасолька-відбивач для студійного світла',
  ),
  siteField('studio-label', 'Студія · надзаголовок', 'Фотостудія в центрі Києва'),
  siteField('studio-action', 'Студія · кнопка', 'Забронювати зал'),
  siteField('studio-image', 'Студія · фото', studioAssets.homeMobile.imgImgHome39015.src, 'image'),
  siteField(
    'studio-mobile-image',
    'Студія · фото на телефоні',
    studioAssets.homeMobile.imgImgHome39015.src,
    'image',
  ),
  siteField(
    'studio-image-alt',
    'Студія · опис зображення',
    'Зал ProPhoto Studio зі студійним світлом і рожевим фоном',
  ),
]);
