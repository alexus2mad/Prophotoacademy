import { siteField, siteSection } from '../../fields';
import { studioAssets } from '@/lib/studio-design/assets';

export const homeExposure = siteSection('exposure', 'Експозиція', [
  siteField('image', 'Фото', studioAssets.home.imgImgHome144002.src, 'image'),
  siteField('meter', 'Шкала експозиції', 'Експозиція'),
]);
