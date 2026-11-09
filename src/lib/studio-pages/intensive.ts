import type { InquiryContext } from '@/lib/inquiries/types';
import type { AcademyContent } from '@/lib/content/types';
import { findOffering } from '@/lib/content/selectors';
import { programSchedule } from '@/lib/program-schedule';
import type { StudioIntensiveBlock, StudioPoint } from './types';

export const studioIntensiveInquiry: InquiryContext = {
  title: 'Інтенсив «Від кадрів до AI artwork»',
  subject: 'workshops',
  source: 'consultation',
};

export function studioIntensiveOffer(content: AcademyContent) {
  const program = content.programs.find((entry) => entry.slug === 'ai-artwork');
  const offering = program ? findOffering(content, program.id) : undefined;
  const schedule = program && offering ? programSchedule(program, offering) : undefined;
  return {
    inquiry: { ...studioIntensiveInquiry, programId: program?.id, offeringId: offering?.id },
    date: schedule ? `${schedule.label}: ${schedule.value}` : 'Дату уточнюємо',
    prices: offering?.packages.length
      ? offering.packages.map((pack) => ({ label: pack.name, price: pack.price }))
      : [
          { label: 'Офлайн', price: 3900 },
          { label: 'Онлайн', price: 3000 },
        ],
    note: 'Умови участі підтвердимо після заявки',
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
