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
        options: { list: ['video', 'article', 'image', 'pdf', 'file', 'zoom'] },
      }),
      text('title', 'Title'),
      defineField({ name: 'required', type: 'boolean' }),
      defineField({ name: 'revision', type: 'number' }),
      defineField({ name: 'body', title: 'Text · Markdown', type: 'text' }),
      text('mediaId', 'Protected media ID'),
      text('alt', 'Alternative text'),
      text('caption', 'Caption'),
      defineField({ name: 'expectedSeconds', type: 'number' }),
      defineField({ name: 'duration', type: 'number' }),
      defineField({
        name: 'pageSeconds',
        type: 'array',
        of: [defineArrayMember({ type: 'number' })],
      }),
    ],
  }),
];
