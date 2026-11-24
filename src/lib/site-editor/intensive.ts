import { siteField } from './fields';
import type { BlockDefinition, IntensiveBlockType, SiteField } from './types';

export const intensiveLibrary = [
  {
    type: 'intensive-intro',
    label: 'Вступ до інтенсиву',
    description: 'Ідея воркшопу, умови участі та вартість',
  },
  {
    type: 'intensive-program',
    label: 'Програма інтенсиву',
    description: 'Розгортні теми з переліками практичних завдань',
  },
  {
    type: 'intensive-gallery',
    label: 'Галерея інтенсиву',
    description: 'Дворядна добірка фотографій із повноекранним переглядом',
  },
  {
    type: 'intensive-format',
    label: 'Формат інтенсиву',
    description: 'Короткий список особливостей заняття',
  },
  {
    type: 'intensive-offer',
    label: 'Квиток на інтенсив',
    description: 'Результат заняття та картка участі',
  },
] as const satisfies ReadonlyArray<BlockDefinition>;

const text = (id: string, label: string) => siteField(id, label, '');
const lines = (id: string, label: string) => siteField(id, label, '', 'multiline');

export const intensiveCoverFields = () => [
  text('accent', 'Рукописний акцент'),
  lines('facts', 'Короткі факти — по одному на рядок'),
];

export function intensiveBlockFields(type: IntensiveBlockType): SiteField[] {
  const title = [
    type === 'intensive-intro'
      ? lines('heading', 'Заголовок — з переносами рядків')
      : text('heading', 'Заголовок'),
    text('accent', 'Рукописний акцент'),
  ];
  const description = lines('description', 'Опис');
  const price = [text('price', 'Ціна для відображення'), text('currency', 'Позначення валюти')];
  switch (type) {
    case 'intensive-intro':
      return [
        ...title,
        description,
        lines('invitation', 'Запрошення'),
        lines('facts', 'Умови участі — по одній на рядок'),
        ...price,
      ];
    case 'intensive-program':
      return [text('eyebrow', 'Надзаголовок'), ...title];
    case 'intensive-gallery':
      return [...title, description];
    case 'intensive-format':
      return title;
    case 'intensive-offer':
      return [
        ...title,
        description,
        text('title', 'Назва квитка'),
        text('subtitle', 'Уточнення під назвою'),
        ...price,
        lines('note', 'Примітка до квитка'),
      ];
  }
}

/** object-position accepts many CSS expressions; editors supply two percentages only. */
export function validCropPosition(value: string) {
  const text = value.trim();
  if (!text) return true;
  const pair = /^(\d{1,3}(?:\.\d{1,2})?)%\s+(\d{1,3}(?:\.\d{1,2})?)%$/.exec(text);
  return Boolean(pair && Number(pair[1]) <= 100 && Number(pair[2]) <= 100);
}
