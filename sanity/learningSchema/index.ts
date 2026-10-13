import { defineType, defineField, defineArrayMember } from 'sanity';
const text = (name: string, title: string) => defineField({ name, title, type: 'string' });
const contentFields = [
  text('id', 'Stable ID'),
  text('programId', 'Marketing program ID'),
  text('title', 'Title'),
  defineField({ name: 'description', type: 'text', title: 'Introduction' }),
  text('cover', 'Cover URL'),
  defineField({
    name: 'modules',
    type: 'array',
    of: [defineArrayMember({ type: 'learningModule' })],
  }),
];
export const learningSchema = [
  defineType({
    name: 'learningCourse',
    title: 'Course draft',
    type: 'document',
    fields: contentFields,
  }),
  defineType({
    name: 'learningRelease',
    title: 'Published curriculum',
    type: 'document',
    readOnly: true,
    fields: [
      text('courseId', 'Course ID'),
      defineField({ name: 'version', type: 'number' }),
      defineField({ name: 'manifest', type: 'object', fields: contentFields }),
    ],
  }),
  defineType({
    name: 'learningModule',
    title: 'Module',
    type: 'object',
    fields: [
      text('id', 'Stable ID'),
      text('title', 'Title'),
      defineField({
        name: 'lessons',
        type: 'array',
        of: [defineArrayMember({ type: 'learningLesson' })],
      }),
    ],
  }),
  defineType({
    name: 'learningLesson',
    title: 'Lesson',
    type: 'object',
    fields: [
      text('id', 'Stable ID'),
      text('title', 'Title'),
      defineField({
        name: 'number',
        title: 'Номер лекції',
        type: 'number',
        validation: (r) => r.integer().min(1),
      }),
      defineField({ name: 'summary', type: 'text' }),
      defineField({ name: 'releaseAt', type: 'datetime' }),
      defineField({ name: 'introductory', type: 'boolean' }),
      defineField({
        name: 'blocks',
        type: 'array',
        of: [defineArrayMember({ type: 'learningBlock' })],
      }),
    ],
  }),
  defineType({
    name: 'learningBlock',
    title: 'Material',
    type: 'object',
    fields: [
      text('id', 'Stable ID'),
      defineField({
        name: 'kind',
        type: 'string',
        options: { list: ['video', 'article', 'image', 'pdf', 'file', 'zoom', 'quiz'] },
      }),
      text('title', 'Title'),
      defineField({ name: 'required', type: 'boolean', hidden: true }),
      defineField({ name: 'revision', type: 'number' }),
      defineField({ name: 'body', title: 'Text · Markdown', type: 'text' }),
      text('mediaId', 'Protected media ID'),
      defineField({ name: 'youtubeUrl', title: 'Додатковий запис YouTube', type: 'url' }),
      text('alt', 'Alternative text'),
      text('caption', 'Caption'),
      defineField({
        name: 'presentation',
        type: 'string',
        options: { list: ['reading', 'practice'] },
      }),
      defineField({
        name: 'quiz',
        type: 'object',
        fields: [
          defineField({
            name: 'passingScore',
            title: 'Прохідний відсоток',
            type: 'number',
            initialValue: 80,
            validation: (r) => r.required().integer().min(1).max(100),
          }),
          defineField({
            name: 'questions',
            type: 'array',
            of: [
              defineArrayMember({
                type: 'object',
                fields: [
                  text('id', 'Stable ID'),
                  text('prompt', 'Question'),
                  text('correctOptionId', 'Correct option ID'),
                  defineField({ name: 'explanation', type: 'text' }),
                  defineField({
                    name: 'options',
                    type: 'array',
                    of: [
                      defineArrayMember({
                        type: 'object',
                        fields: [text('id', 'Stable ID'), text('text', 'Answer')],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      defineField({ name: 'expectedSeconds', type: 'number', hidden: true }),
      defineField({ name: 'duration', type: 'number' }),
      defineField({
        name: 'pageSeconds',
        type: 'array',
        of: [defineArrayMember({ type: 'number' })],
      }),
    ],
  }),
];
