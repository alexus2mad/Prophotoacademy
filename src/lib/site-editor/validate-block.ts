import { HttpError } from '../http';
import { blockFields, blockLibrary, isCollection, itemFieldId } from './blocks';
import { validCardLink } from './card-link';
import type { SiteSection } from './types';

const uuidBlock = /^block-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateBlock(
  section: SiteSection,
  publishing: boolean,
  validateImage: (src: string) => void,
) {
  const type = section.blockType;
  if (!type) throw new HttpError(400, 'Оберіть блок із бібліотеки.');
  const itemIds = section.itemIds ?? [];
  const definition = blockLibrary.find((block) => block.type === type);
  const expected = blockFields(type, itemIds);
  if (
    !uuidBlock.test(section.id) ||
    section.label !== definition?.label ||
    isCollection(type) !== (section.itemIds !== undefined) ||
    new Set(itemIds).size !== itemIds.length ||
    section.fields.length !== expected.length ||
    section.fields.some(
      ({ id, kind, label }, i) =>
        id !== expected[i].id || kind !== expected[i].kind || label !== expected[i].label,
    )
  )
    throw new HttpError(400, 'Структура блоку не відповідає його типу.');

  const values = new Map(section.fields.map((field) => [field.id, field.value]));
  const value = (id: string) => values.get(id) ?? '';
  const required = (id: string, message: string) => {
    if (publishing && !value(id).trim()) throw new HttpError(400, section.label + ' — ' + message);
  };
  for (const field of section.fields) {
    if (field.kind === 'image') validateImage(field.value);
  }
  if (type === 'heading') required('heading', 'введіть заголовок.');
  if (type === 'paragraph') required('text', 'додайте текст.');
  if (type === 'image') {
    required('image', 'оберіть фотографію.');
    required('alt', 'опишіть, що зображено на фотографії.');
  }
  if (!isCollection(type)) return;
  if (publishing && !itemIds.length)
    throw new HttpError(400, section.label + ' — додайте принаймні один елемент.');
  for (const [index, id] of itemIds.entries()) {
    const fieldId = (key: string) => itemFieldId(id, key);
    const position = String(index + 1);
    if (type === 'cards') {
      required(fieldId('title'), 'додайте заголовок картки ' + position + '.');
      if (!validCardLink(value(fieldId('href'))))
        throw new HttpError(
          400,
          'Картка ' + position + ' — вкажіть адресу HTTPS, шлях сайту або якір.',
        );
    } else {
      required(fieldId('image'), 'оберіть фотографію для слайда ' + position + '.');
    }
    if (value(fieldId('image'))) required(fieldId('alt'), 'опишіть фотографію ' + position + '.');
  }
}
