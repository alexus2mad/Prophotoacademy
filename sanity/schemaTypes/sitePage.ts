import { defineArrayMember, defineField, defineType } from 'sanity';

const page = defineField({
  name: 'page',
  title: 'Вміст сторінки',
  type: 'object',
  fields: [
    defineField({ name: 'path', title: 'Адреса', type: 'string' }),
    defineField({ name: 'title', title: 'Назва', type: 'string' }),
    defineField({ name: 'kind', title: 'Тип сторінки', type: 'string' }),
    defineField({ name: 'template', title: 'Початковий шаблон', type: 'string' }),
    defineField({
      name: 'sections',
      title: 'Розділи',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'id', title: 'Ключ', type: 'string' }),
            defineField({ name: 'label', title: 'Назва розділу', type: 'string' }),
            defineField({ name: 'blockType', title: 'Тип блоку', type: 'string' }),
            defineField({ name: 'placement', title: 'Місце блоку на сторінці', type: 'string' }),
            defineField({
              name: 'itemIds',
              title: 'Порядок елементів',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
            defineField({
              name: 'fields',
              title: 'Поля',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({ name: 'id', title: 'Ключ', type: 'string' }),
                    defineField({ name: 'label', title: 'Назва поля', type: 'string' }),
                    defineField({ name: 'kind', title: 'Тип', type: 'string' }),
                    defineField({ name: 'value', title: 'Значення', type: 'text' }),
                    defineField({
                      name: 'style',
                      title: 'Типографіка',
                      type: 'object',
                      fields: [
                        defineField({ name: 'font', title: 'Шрифт', type: 'string' }),
                        defineField({ name: 'size', title: 'Розмір', type: 'string' }),
                        defineField({ name: 'color', title: 'Колір', type: 'string' }),
                        defineField({ name: 'weight', title: 'Накреслення', type: 'string' }),
                        defineField({ name: 'align', title: 'Вирівнювання', type: 'string' }),
                      ],
                    }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'value' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'label' } },
        }),
      ],
    }),
  ],
});

export const sitePageDocuments = ['academySitePage', 'academySitePageWorkspace'].map((name) =>
  defineType({
    name,
    title: name === 'academySitePage' ? 'Опубліковані сторінки' : 'Робочі версії сторінок',
    type: 'document',
    readOnly: true,
    description:
      'Відкрийте «Сайт» у кабінеті адміністратора, щоб редагувати та публікувати сторінки.',
    fields: [
      defineField({ name: 'path', title: 'Адреса', type: 'string' }),
      page,
      defineField({
        name: 'images',
        title: 'Фотографії сторінки',
        type: 'array',
        of: [defineArrayMember({ type: 'reference', to: [{ type: 'sanity.imageAsset' }] })],
      }),
    ],
    preview: { select: { title: 'page.title', subtitle: 'path' } },
  }),
);
