import { studioIntensiveClients, studioIntensiveExperience } from '@/lib/studio-pages/intensive';
import { siteField, siteSection } from '../../fields';
import { studioAssets } from '@/lib/studio-design/assets';

export const featuredArtworks = [
  {
    asset: studioAssets.aiArtwork.imgImgWs144002,
    alt: 'Фантазійний портрет серед скульптурних дерев і квітів',
  },
  {
    asset: studioAssets.aiArtwork.imgImgWs144003,
    alt: 'Портрет дівчини з квітами у волоссі на блакитному тлі',
  },
  {
    asset: studioAssets.artifact.ws_art3,
    alt: 'Авторська сюрреалістична композиція з квітами',
  },
  {
    asset: studioAssets.artifact.ws_art4,
    alt: 'Авторська робота Анастасії Князєвої з генеративною обробкою',
  },
];

export const artworkWorkshop = siteSection('workshop', 'Інтенсив, лекторка й приклади робіт', [
  siteField('image', 'Фото', studioAssets.aiArtwork.imgImgWs144001.src, 'image'),
  siteField('image-alt', 'Перший екран · Опис зображення', 'Модель у білій сукні серед троянд'),
  siteField(
    'mobile-image',
    'Мобільний варіант · Фото',
    studioAssets.aiArtworkMobile.imgImgWs39001.src,
    'image',
  ),
  siteField('hero-emphasis', 'Перший екран · Акцент заголовка', '*від кадрів до'),
  siteField('hero-title', 'Перший екран · Заголовок', 'AI artwork'),
  siteField('hero-description', 'Перший екран · Опис', 'студійна зйомка + генеративна обробка'),
  siteField('program-action', 'Програма · Текст кнопки', 'Програма'),
  siteField('announcement-eyebrow', 'Анонс · Надзаголовок', 'Анонс'),
  siteField('announcement-title', 'Анонс · Заголовок', 'Практичний інтенсив'),
  siteField('practice', 'Тривалість практики', '4–5 годин практики'),
  siteField('requirements-title', 'Що підготувати · Заголовок', 'Photoshop + Firefly'),
  siteField(
    'requirements-description',
    'Що підготувати · Опис',
    'Потрібен ноутбук із встановленим Adobe Photoshop та активними генеративними кредитами або підпискою Cloud Pro для роботи з Adobe Firefly.',
    'multiline',
  ),
  siteField('lecturer-eyebrow', 'Лекторка · Надзаголовок', 'Ваша лекторка'),
  siteField('lecturer-name', 'Лекторка · Назва', 'Анастасія Князєва'),
  siteField('clients-title', 'Клієнти · Заголовок', 'Створювала арт для'),
  siteField('gallery-title', 'Галерея · Заголовок', 'Роботи, які ти'),
  siteField('gallery-emphasis', 'Галерея · Акцент заголовка', '*навчишся'),
  siteField('gallery-end', 'Галерея · Завершення заголовка', 'створювати'),
  siteField('gallery-name', 'Галерея · Назва', 'Роботи AI artwork'),
  ...featuredArtworks.flatMap((work, i) => [
    siteField('work-' + i + '-image', 'Робота ' + (i + 1) + ' · фото', work.asset.src, 'image'),
    siteField('work-' + i + '-image-alt', 'Робота ' + (i + 1) + ' · опис фото', work.alt),
  ]),
  ...studioIntensiveExperience.flatMap((item, i) => [
    siteField('faculty-' + i + '-title', item.title + ' · заголовок', item.title),
    siteField('faculty-' + i + '-description', item.title + ' · опис', item.text, 'multiline'),
  ]),
  ...studioIntensiveClients.map((client, i) =>
    siteField('client-' + i, 'Клієнт ' + (i + 1), client),
  ),
  siteField('purchase-inquiry-title', 'Після відкриття продажу · заголовок', 'Маєте'),
  siteField('purchase-inquiry-emphasis', 'Після відкриття продажу · акцент', 'запитання'),
  siteField('closed-inquiry-title', 'Заявка · заголовок', 'Залиште'),
  siteField('closed-inquiry-emphasis', 'Заявка · акцент', 'заявку'),
]);
