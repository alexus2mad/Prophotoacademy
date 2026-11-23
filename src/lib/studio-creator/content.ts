import { creatorAssets } from './assets';
import { creatorFaculty } from './faculty';
import type { CourseTextItem, StudioCourseEditorial } from './types';

export const creatorCurriculumId = 'program-curriculum';

const audience: readonly CourseTextItem[] = [
  {
    title: 'Початківців',
    text: 'Налаштування камери, світло, композиція й колір, обробка фото та відео в Lightroom і Photoshop.',
  },
  {
    title: 'Фотографів з досвідом',
    text: 'Практика на реальних комерційних і репортажних зйомках — у студії й просто неба, з новими кадрами в портфоліо. Обсяг практики залежить від пакета.',
  },
  {
    title: 'Мобільних контент-креаторів',
    text: 'Розбираємо камеру телефону, щоб створювати якісний контент і впевнено працювати зі світлом та композицією.',
  },
  { title: 'UGC-креаторів', text: 'Знімати й обробляти контент для брендів на новому рівні.' },
  {
    title: 'Власників бізнесу',
    text: 'Самостійно створювати контент для своїх акаунтів: портрет, предмет, Reels, відео для TikTok і YouTube.',
  },
  {
    title: 'SMM-спеціалістів',
    text: 'Якісні фото й відео всіх форматів для замовників і розуміння потрібної техніки.',
  },
];

const benefits: readonly CourseTextItem[] = [
  {
    title: 'Комерційна практика',
    text: 'Практичні воркшопи у GOLD і PLATINUM; формат участі уточнюйте. Підготовка першого замовлення — у PLATINUM.',
  },
  {
    title: 'Навчання через практику',
    text: 'Зйомка, розбір робіт і практичні завдання. Формат підтримки — за умовами обраного пакета.',
  },
  { title: 'Лектори-практики', text: 'Сильні портфоліо та великий досвід викладання.' },
  {
    title: 'Лекції та записи',
    text: 'Формат лекцій і тривалість доступу до записів залежать від пакета.',
  },
  {
    title: 'Перевірена методологія',
    text: 'Баланс теорії та практики, перевірений на тисячах студентів.',
  },
  {
    title: 'Вихід на комерцію',
    text: 'Пошук замовників і розвиток. Особиста консультація та підготовка першого замовлення — у PLATINUM.',
  },
];

const learningSteps: readonly CourseTextItem[] = [
  {
    title: 'Реєстрація',
    text: 'Оберіть свій пакет навчання. Після підтвердженої оплати команда надішле організаційні деталі вашого потоку.',
  },
  {
    title: 'Підготовка',
    text: 'Команда повідомить розклад, формат практики й організаційні деталі вашого потоку.',
  },
  {
    title: 'Лекції',
    text: 'У BASE навчайтеся самостійно. Формат лекцій, кількість занять і строк доступу залежать від пакета.',
  },
  {
    title: 'Домашні роботи',
    text: 'Самостійна практика. Перевірка й зворотний зв’язок у чаті — у пакеті PLATINUM.',
  },
  {
    title: 'Диплом',
    text: 'У PLATINUM — для тих, хто виконав обов’язкові завдання та дипломну роботу у визначені терміни.',
  },
];

/** Editorial copy from Figma 949:443; commerce remains in the offering model. */
export const creatorEditorial: StudioCourseEditorial = {
  hero: {
    asset: creatorAssets.hero,
    alt: 'Чорно-білий портрет жінки у серпанку',
    hand: '*комерційний',
    title: 'Контент-креатор',
    subject: 'Курс фото та відеозйомки',
  },
  intro: {
    eyebrow: 'BASE: самостійно · GOLD і PLATINUM: воркшопи',
    heading: { lines: ['Неважливо, на', 'що ви знімаєте', 'Важливо'], hand: '*як' },
    description:
      'Камера, телефон чи плівка — ми навчаємо бачити: композицію, світло, колір і налаштування камери. Тисячі випускників уже переконалися.',
  },
  audience,
  benefits,
  learningSteps,
  worksOpening: {
    ids: ['student-beauty-shadows', 'student-lipstick-study'],
    extras: [
      {
        ...creatorAssets.monochrome,
        id: 'creator-monochrome',
        device: 'camera',
        alt: 'Чорно-білий портрет жінки, робота студента',
      },
      {
        ...creatorAssets.curly,
        id: 'creator-curly',
        device: 'camera',
        preserveFraming: true,
        alt: 'Портрет усміхненої жінки з кучерявим волоссям',
      },
    ],
  },
  faculty: creatorFaculty,
};
