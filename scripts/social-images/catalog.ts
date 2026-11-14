import content from '../../content/academy.json';
import assets from '../../src/lib/studio-design/assets.json';
import homePhotos from '../../src/lib/photography/home-images.json';
import type { SocialCard, SocialPhoto } from './types';

function photo(id: string): SocialPhoto {
  const image = content.images.find((entry) => entry.id === id);
  if (!image) throw new Error(`Unknown public photograph: ${id}`);
  return {
    src: image.src,
    alt: image.alt,
    ...(id === 'practice' ? { position: '50% 6%', squarePosition: '50% 8%' } : {}),
    ...(id === 'workshop' ? { position: '85% 50%', squarePosition: '50% 25%' } : {}),
  };
}

const gold = {
  src: assets.artifact.dir_gold.src,
  alt: 'Портрет у золотій тканині',
  position: '50% 11%',
  squarePosition: '50% 14%',
};
const snow = {
  src: assets.academy.imgImgSnow.src,
  alt: 'Портрет серед засніжених гір',
  position: '50% 57%',
};
const founder = {
  ...homePhotos.offline,
  alt: 'Олена Попова — засновниця ProPhoto Academy',
  position: '50% 4%',
  squarePosition: '50% 8%',
};
const underwater = {
  src: assets.home.imgImgHome144001.src,
  alt: 'Підводний портрет із тканинами',
  position: '50% 20%',
  squarePosition: '69% 50%',
};

export const socialCards: SocialCard[] = [
  {
    path: '/',
    title: 'ProPhoto Academy — фотографія починається з бачення',
    lines: ['ФОТОГРАФІЯ', 'ПОЧИНАЄТЬСЯ', 'З БАЧЕННЯ'],
    description:
      'Курси фотографії, відео та створення контенту на телефон і камеру. Онлайн і в Києві.',
    subtitle: 'Навчання фото, відео та контенту',
    photos: [underwater],
  },
  {
    path: '/academy',
    title: 'Академія',
    lines: ['НАВЧАЙТЕСЯ', 'СТВОРЮВАТИ'],
    description: 'Курси, воркшопи, індивідуальне та корпоративне навчання ProPhoto Academy.',
    label: 'НАВЧАННЯ',
    subtitle: 'Курси · воркшопи · практика',
    photos: [gold],
  },
  {
    path: '/courses',
    title: 'Курси та програми',
    lines: ['ЗНАЙДІТЬ', 'СВІЙ КУРС'],
    description:
      'Навчання фотографії, відео й візуального контенту. Оберіть програму під вашу мету.',
    subtitle: 'Фото · відео · контент',
    photos: [gold],
  },
  {
    path: '/visual-content',
    title: 'Візуальний контент на телефон та фотокамеру',
    lines: ['ВІЗУАЛЬНИЙ', 'КОНТЕНТ'],
    description: 'Основи фотографії, композиції, світла та відео на телефон і фотокамеру.',
    label: 'КУРС',
    subtitle: 'На телефон та фотокамеру',
    photos: [gold],
  },
  {
    path: '/food-product-photography',
    title: 'Комерційний контент-кріейтор',
    lines: ['КОМЕРЦІЙНИЙ', 'КОНТЕНТ'],
    description: 'Предметна та фуд-фотографія, світло, фактури й відео для брендів.',
    label: 'КУРС',
    subtitle: 'Фото й відео для брендів',
    photos: [photo('commercial')],
  },
  {
    path: '/course-smm-instagram',
    title: 'Інста, яка продає',
    lines: ['ІНСТА,', 'ЯКА ПРОДАЄ'],
    description: 'Позиціонування, візуальний контент і розвиток Instagram для власного бренду.',
    label: 'КУРС',
    subtitle: 'Позиціонування та візуальний контент',
    photos: [snow],
  },
  {
    path: '/food-photography',
    title: 'Фуд фото і предметна зйомка',
    lines: ['ФУД ФОТО', 'І ПРЕДМЕТНА', 'ЗЙОМКА'],
    description: 'Фуд-фотографія та предметна зйомка: композиція, світло й робота з продуктом.',
    label: 'КУРС',
    subtitle: 'Композиція · світло · продукт',
    photos: [photo('student-pasta')],
  },
  {
    path: '/pro-photo-lab',
    title: 'Pro Photo Lab: Content Day',
    lines: ['PRO PHOTO LAB', 'CONTENT DAY'],
    description: 'Зустрічі, лекції та практика створення контенту в ProPhoto Academy.',
    label: 'ПРАКТИКА',
    subtitle: 'Зустрічі, лекції та зйомка',
    photos: [photo('workshop')],
  },
  {
    path: '/individual-training',
    title: 'Індивідуальне навчання',
    lines: ['ІНДИВІДУАЛЬНЕ', 'НАВЧАННЯ'],
    description: 'Індивідуальна програма фотографії, відео та контенту під вашу мету.',
    label: 'ОСОБИСТА ПРОГРАМА',
    subtitle: 'Під вашу мету та досвід',
    photos: [photo('practice')],
  },
  {
    path: '/corporate-training',
    title: 'Навчання для команди',
    lines: ['НАВЧАННЯ', 'ДЛЯ КОМАНДИ'],
    description: 'Фотографія, відео та візуальний контент для вашої команди й бізнесу.',
    subtitle: 'Фото, відео та контент для бізнесу',
    photos: [photo('workshop')],
  },
  {
    path: '/ai-artwork',
    title: 'Від кадрів до AI artwork',
    lines: ['ВІД КАДРІВ', 'ДО AI ARTWORK'],
    description:
      'Практичний інтенсив зі створення візуальних історій за допомогою штучного інтелекту.',
    label: 'ПРАКТИЧНИЙ ІНТЕНСИВ',
    subtitle: 'Ваша уява. Нові інструменти',
    photos: [{ ...photo('ai-artwork'), position: '60% 50%', squarePosition: '48% 50%' }],
  },
  {
    path: '/about-us',
    title: 'Про академію',
    lines: ['ЛЮДИ, ЯКІ', 'НАВЧАЮТЬ', 'БАЧИТИ'],
    description: 'Засновниця Олена Попова, команда та підхід до навчання ProPhoto Academy.',
    subtitle: 'Досвід, творчість і практика',
    photos: [founder],
  },
  {
    path: '/student-work',
    title: 'Роботи студентів',
    lines: ['РОБОТИ', 'СТУДЕНТІВ'],
    description: 'Портрети, предметні та фуд-композиції, створені студентами ProPhoto Academy.',
    subtitle: 'Від першої ідеї до власного кадру',
    photos: [
      { ...photo('student-colour-portrait'), position: '50% 18%', squarePosition: '65% 50%' },
    ],
  },
  {
    path: '/reviews',
    title: 'Відгуки студентів',
    lines: ['ДОСВІД', 'НАШИХ', 'СТУДЕНТІВ'],
    description: 'Відгуки студентів про навчання та практику в ProPhoto Academy.',
    label: 'ВІДГУКИ',
    subtitle: 'Про навчання власними словами',
    photos: [],
  },
  {
    path: '/contacts',
    title: 'Контакти',
    lines: ['БУДЬМО', 'НА ЗВ’ЯЗКУ'],
    description: 'Зв’яжіться з ProPhoto Academy щодо програм, форматів та організації навчання.',
    label: 'КОНТАКТИ',
    subtitle: 'Допоможемо обрати своє навчання',
    photos: [],
  },
  {
    path: '/privacy-policy',
    title: 'Політика конфіденційності',
    lines: ['ПОЛІТИКА', 'КОНФІДЕНЦІЙНОСТІ'],
    description: 'Як ProPhoto Academy обробляє та захищає персональні дані.',
    label: 'ІНФОРМАЦІЯ',
    subtitle: 'Персональні дані та їх захист',
    photos: [],
  },
  {
    path: '/terms-of-service',
    title: 'Договір публічної оферти',
    lines: ['ПУБЛІЧНА', 'ОФЕРТА'],
    description: 'Умови надання освітніх послуг ProPhoto Academy.',
    label: 'ІНФОРМАЦІЯ',
    subtitle: 'Умови навчання в академії',
    photos: [],
  },
  {
    path: '/photo-studio',
    title: 'ProPhoto Studio',
    lines: ['ПРОСТІР', 'ДЛЯ ЗЙОМКИ'],
    description: 'Фотостудія ProPhoto: простір і обладнання для створення контенту.',
    label: 'СТУДІЯ',
    subtitle: 'Світло, простір, ваша ідея',
    photos: [{ ...homePhotos.studio, squarePosition: '54% 50%' }],
    brand: 'hub',
  },
  {
    path: '/shop',
    title: 'ProPhoto Shop',
    lines: ['ІНСТРУМЕНТИ', 'ДЛЯ ТВОРЧОСТІ'],
    description: 'Обладнання для фотографії, відео та створення контенту.',
    subtitle: 'Світло та обладнання',
    photos: [homePhotos.shop],
    brand: 'shop',
  },
];

const privatePages = [
  ['/login', 'Вхід до кабінету', ['ВАШЕ', 'НАВЧАННЯ'], 'Увійдіть до кабінету студента'],
  ['/account', 'Кабінет студента', ['ВАШІ КУРСИ', 'ВАШ ПРОГРЕС'], 'Навчання у вашому темпі'],
  ['/learn', 'Навчання', ['ПРОДОВЖУЙТЕ', 'НАВЧАТИСЯ'], 'Уроки та матеріали курсу'],
  ['/admin', 'Адміністрування', ['ПРОСТІР', 'ДЛЯ НАВЧАННЯ'], 'Керування навчанням в академії'],
  ['/checkout', 'Оформлення замовлення', ['ВАШ НАСТУПНИЙ', 'КРОК'], 'Оформлення замовлення'],
  ['/thanks', 'Статус замовлення', ['ВАШЕ', 'ЗАМОВЛЕННЯ'], 'Інформація про ваше замовлення'],
] as const;

for (const [path, title, lines, subtitle] of privatePages) {
  socialCards.push({
    path,
    title,
    lines: [...lines],
    description: subtitle,
    subtitle,
    photos: [],
  });
}

for (const [path, title, lines, subtitle] of [
  [
    '/hub',
    'ProPhoto Hub — фотостудія в Києві',
    ['ПРОСТІР', 'ДЛЯ ЗЙОМКИ'],
    'Циклорама · подкаст-зала · гримерна',
  ],
  ['/hub/about', 'Про ProPhoto Hub', ['ПРО СТУДІЮ'], 'Простір для ваших ідей'],
  ['/hub/contact', 'Контакти ProPhoto Hub', ['ЗУСТРІНЕМОСЯ', 'У СТУДІЇ'], 'Фотостудія в Києві'],
  [
    '/hub/booking',
    'Бронювання студії',
    ['ВАША', 'НАСТУПНА', 'ЗЙОМКА'],
    'Оберіть зал і зручний час',
  ],
] as const) {
  socialCards.push({
    path,
    title,
    lines: [...lines],
    description: subtitle,
    subtitle,
    photos: [{ ...homePhotos.studio, squarePosition: '54% 50%' }],
    brand: 'hub',
  });
}
for (const room of content.rooms) {
  socialCards.push({
    path: `/hub/${room.slug}`,
    title: room.title,
    lines: [room.title.toUpperCase()],
    description: `${room.title} у ProPhoto Hub. Простір для зйомки в Києві.`,
    subtitle: 'Простір для зйомки в Києві',
    photos: [photo(room.imageId)],
    brand: 'hub',
  });
}
for (const session of content.practiceSessions) {
  socialCards.push({
    path: `/hub/${session.slug}`,
    title: session.title,
    lines: ['КОНТЕНТ-', 'ПРАКТИКА'],
    description: 'Підготовка до зйомки та практика в просторі ProPhoto Hub.',
    subtitle: 'Від знань до власної зйомки',
    photos: [photo(session.imageId)],
    brand: 'hub',
  });
}
