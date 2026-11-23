import { z } from 'zod';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { HttpError } from '../http';
import { legacyAcademyIndexPaths } from '../navigation/academy';
import { editorMode, localDirectory, marketingImagePrefix } from './storage/config';
import type { SitePage } from './types';

export const pagePathSchema = z
  .string()
  .max(81)
  .regex(
    /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/,
    'Вкажіть адресу латинськими літерами, цифрами та дефісами.',
  );
export const pageTitleSchema = z.string().trim().min(1, 'Вкажіть назву сторінки.').max(240);
export const newPageKind = z.enum(['course', 'workshop', 'landing']);
export const pageSchema = z.object({
  path: pagePathSchema,
  title: pageTitleSchema,
  kind: z.enum(['home', 'course', 'workshop', 'landing']),
  sections: z
    .array(
      z.object({
        id: z.string().min(1).max(200),
        label: z.string().min(1).max(240),
        fields: z
          .array(
            z.object({
              id: z.string().min(1).max(200),
              label: z.string().min(1).max(500),
              kind: z.enum(['text', 'multiline', 'image']),
              value: z.string().max(50000),
            }),
          )
          .max(1000),
      }),
    )
    .max(250),
});

// Also protect framework/static prefixes and historical URLs redirected before slug resolution.
export const reservedPaths = new Set([
  '/',
  '/401',
  '/api',
  '/account',
  '/login',
  '/admin',
  '/learn',
  '/demo',
  '/hub',
  '/operations',
  '/studio',
  '/sandbox',
  '/checkout',
  '/thanks',
  '/academy',
  '/about-us',
  '/reviews',
  '/contacts',
  '/student-work',
  ...legacyAcademyIndexPaths,
  '/food-photography',
  '/photo-studio',
  '/shop',
  '/ai-artwork',
  '/images',
  '/brand',
  '/social',
  '/design',
  '/fonts',
  '/learning',
  '/social-previews',
  '/email',
  '/demo-media',
]);

function validateImage(src: string, original?: string) {
  if (!src || src === original) return;
  if (/^\/api\/site-content\/images\/[a-f0-9]{64}$/.test(src)) {
    if (
      editorMode() === 'local' &&
      existsSync(path.join(localDirectory(), 'images', path.basename(src) + '.webp'))
    )
      return;
  }
  if (
    /^\/(?:images|design|brand)\/[\w./%-]+\.(?:webp|avif|jpe?g|png)$/i.test(src) &&
    !src.includes('..') &&
    !src.includes('%') &&
    existsSync(path.join('public', src.slice(1)))
  )
    return;
  const root = marketingImagePrefix();
  if (
    root &&
    src.startsWith(root) &&
    /^[a-f0-9]+-\d+x\d+\.(?:webp|avif|jpe?g|png)$/.test(src.slice(root.length))
  )
    return;
  throw new HttpError(400, 'Оберіть зображення редактора або завантажте новий файл.');
}

export function validateEdit(
  input: unknown,
  baseline: SitePage,
  seeded: boolean,
  publishing: boolean,
) {
  const page = pageSchema.parse(input);
  const invalid = () =>
    new HttpError(400, 'Структура сторінки змінилася. Відкрийте актуальну версію.');
  if (
    page.path !== baseline.path ||
    page.kind !== baseline.kind ||
    page.sections.length < baseline.sections.length ||
    (seeded && page.sections.length !== baseline.sections.length) ||
    new Set(page.sections.map((s) => s.id)).size !== page.sections.length
  )
    throw invalid();
  for (const [index, section] of page.sections.entries()) {
    const extra = index >= baseline.sections.length;
    const expected = extra
      ? baseline.sections.find((s) => s.id === 'landing-body')
      : baseline.sections[index];
    if (
      !expected ||
      (extra ? !/^landing-body-[a-z0-9-]{1,80}$/.test(section.id) : section.id !== expected.id) ||
      section.fields.length !== expected.fields.length ||
      (!extra && section.label !== expected.label)
    )
      throw invalid();
    for (const [i, field] of section.fields.entries()) {
      const original = expected.fields[i];
      if (
        field.id !== original.id ||
        field.kind !== original.kind ||
        field.label !== original.label
      )
        throw invalid();
      if (field.kind === 'image') {
        validateImage(field.value, extra ? undefined : original.value);
        const altIds = [field.id + '-alt', field.id.replace(/-(mobile-)?image$/, '-alt'), 'alt'];
        const alt = section.fields.find((f) => f.kind === 'text' && altIds.includes(f.id));
        if (publishing && field.value && field.value !== original.value && alt && !alt.value.trim())
          throw new HttpError(400, 'Додайте опис нового зображення перед публікацією.');
      }
    }
  }
  return page;
}
