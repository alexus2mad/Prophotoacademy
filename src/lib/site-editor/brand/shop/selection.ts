import { siteField, siteSection } from '../../fields';

export const equipmentCategories = [
  'Камера',
  'Обʼєктив',
  'Світло',
  'Мікрофон',
  'Штатив',
  'Комплект під ключ',
];

export const shopSelection = siteSection('selection', 'Підбір обладнання', [
  siteField('eyebrow', 'Надзаголовок', 'Обладнання'),
  siteField('title', 'Заголовок', 'Що'),
  siteField('emphasis', 'Акцент заголовка', '*підібрати?'),
  siteField(
    'intro',
    'Вступ',
    'Тут ви знайдете всю необхідну техніку для зйомки, яку ми допоможемо підібрати під ваші задачі й бюджет.',
    'multiline',
  ),
  siteField('legend', 'Підказка вибору', 'Оберіть, що потрібно'),
  siteField('shop-action', 'Магазин · Текст кнопки', 'Переглянути обладнання в магазині →'),
  ...equipmentCategories.map((item, i) => siteField('category-' + i, 'Категорія ' + (i + 1), item)),
]);
