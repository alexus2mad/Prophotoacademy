import type { InquiryContext } from '@/lib/inquiries/types';
import type { AcademyContent } from '@/lib/content/types';
import { findOffering } from '@/lib/content/selectors';
import { programSchedule } from '@/lib/program-schedule';
import type { EnrollmentOptions } from '@/lib/commerce/types';
import type { StudioIntensiveBlock, StudioIntensivePrice, StudioPoint } from './types';

export const studioIntensiveInquiry: InquiryContext = {
  title: 'Інтенсив «Від кадрів до AI artwork»',
  subject: 'workshops',
  source: 'consultation',
};

export function studioIntensiveOffer(content: AcademyContent, enrollment?: EnrollmentOptions) {
  const program = content.programs.find((entry) => entry.slug === 'ai-artwork');
  const offering = program ? findOffering(content, program.id) : undefined;
  const schedule = program && offering ? programSchedule(program, offering) : undefined;
  const prices: StudioIntensivePrice[] = offering?.packages.length
    ? offering.packages.map((pack) => ({
        id: pack.id,
        label: pack.name,
        price: pack.price,
        purchaseUrl:
          !pack.inquiryOnly && enrollment?.packageIds.includes(pack.id)
            ? `/checkout?offering=${encodeURIComponent(offering.id)}&package=${encodeURIComponent(pack.id)}`
            : undefined,
        status:
          pack.availability === 'soldOut'
            ? 'Місць немає'
            : pack.availability === 'archived' || offering.availability === 'archived'
              ? 'Продаж завершено'
              : undefined,
      }))
    : [
        { id: 'reference-offline', label: 'Офлайн', price: 3900 },
        { id: 'reference-online', label: 'Онлайн', price: 3000 },
      ];
  const purchaseAvailable = prices.some((price) => Boolean(price.purchaseUrl));
  return {
    inquiry: { ...studioIntensiveInquiry, programId: program?.id, offeringId: offering?.id },
    date: schedule
      ? offering?.verificationRequired === false && schedule.date
        ? schedule.value
        : `${schedule.label}: ${schedule.value}`
      : 'Дату уточнюємо',
    dateTime: schedule?.date,
    time: schedule?.time,
    prices,
    purchaseAvailable,
    purchaseNotice:
      purchaseAvailable && enrollment?.mode === 'mock'
        ? 'Тестове оформлення — без оплати й підтвердження участі'
        : undefined,
    note: purchaseAvailable
      ? 'Маєте запитання про формат участі? Залиште контакт — допоможемо обрати.'
      : 'Умови участі підтвердимо після заявки',
  };
}

export const studioIntensiveBlocks: StudioIntensiveBlock[] = [
  {
    title: 'Практична зйомка',
    duration: '~1 година',
    paragraphs: [
      'Створення вихідного кадру. Зйомка моделі в студійному просторі: створення якісної вихідної бази, яка стане основою для подальшої AI-трансформації та розбудови візуального світу.',
      'Аналіз та техніка роботи зі світлом. Розбір світлової схеми: чому обрано саме таке джерело та налаштування, як світло впливає на реалістичність подальшого монтажу (з інтеграцією матеріалів курсу Олени).',
      'Режисура та робота з моделлю. Психологія взаємодії на майданчику: як чітко донести завдання, отримати потрібні емоції, пластику та позинг під конкретний задум.',
    ],
  },
  {
    title: 'Візуальне бачення та концептуалізація',
    duration: '~45 хвилин',
    paragraphs: [
      'Розвиток візуальної спостережливості. Як помічати цікаві деталі в кінематографі, мистецтві та повсякденному житті та інтегрувати їх у власну авторську фотографію.',
      'Робота з референсами та мудбординг. Структурований пошук ідей у Pinterest: формування концепції, робота з фактурами, атмосферою та колірними палітрами.',
    ],
  },
  {
    title: 'Штучний інтелект і промптинг',
    duration: '~45 хвилин',
    paragraphs: [
      'AI як творчий інструмент фотографа. Використання генеративних моделей (Gemini, ChatGPT) для формулювання точних та ефективних текстових запитів (промптів).',
      'Принципи побудови промптів для Adobe Firefly: від ідеї до конкретного текстового опису обʼєктів, текстур та фону.',
    ],
  },
  {
    title: 'Практика в Adobe Photoshop',
    duration: '~1,5–2 години',
    paragraphs: [
      'Генеративна обробка та маніпуляції. Практична робота з інструментом Generative Fill у Photoshop: генерація нового фону, інтеграція предметів, створення складних текстур та масивів навколо моделі.',
      'Безшовне вписування згенерованих елементів у кадр, збереження природності світлотіньового малюнка.',
    ],
  },
  {
    title: 'Підсумки та Q&A',
    duration: '~30 хвилин',
    paragraphs: [
      'Розбір робіт та сесія запитань-відповідей. Аналіз отриманих результатів учасників, фідбек, відповіді на запитання щодо нюансів зйомки, промптингу та підписки Cloud Pro.',
    ],
  },
];

export const studioIntensiveExperience: StudioPoint[] = [
  {
    title: '7+ років',
    text: 'У зйомці та викладанні вчу створювати кадр, який продає та надихає.',
  },
  { title: 'Масштабні проєкти', text: 'Авторка масштабної рекламної кампанії Adidas.' },
  {
    title: 'Блогери',
    text: 'У портфоліо обкладинки для відомих людей, артистів та популярних блогерів.',
  },
  {
    title: 'Поєдную',
    text: 'Класичну ретуш у Photoshop та генеративний штучний інтелект (AI) для створення унікального візуалу.',
  },
];

export const studioIntensiveClients = [
  'Маша Кондратенко',
  'Брикулець',
  'Go_A',
  'MOLODI',
  'Роксолана',
  'Майорова',
  'Шмальгаузен',
  'Азіза',
];
