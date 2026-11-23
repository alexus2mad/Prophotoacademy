import { z } from 'zod';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { HttpError } from '../http';
import { legacyAcademyIndexPaths } from '../navigation/academy';
import { editorMode, localDirectory, marketingImagePrefix } from './storage/config';
import {
  blockTypes,
  pageTemplateIds,
  textAlignments,
  textColors,
  textFonts,
  textSizes,
  textWeights,
} from './options';
import { isStylableField, maxBlockItems } from './blocks';
import { validateBlock } from './validate-block';
import { pagePlacements } from './placements';
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
export const pageTemplateSchema = z.enum(pageTemplateIds);
const styleSchema = z
  .object({
    font: z.enum(textFonts).optional(),
    size: z.enum(textSizes).optional(),
    color: z.enum(textColors).optional(),
    weight: z.enum(textWeights).optional(),
    align: z.enum(textAlignments).optional(),
  })
  .strict();
export const pageSchema = z.object({
  path: pagePathSchema,
  title: pageTitleSchema,
  kind: z.enum(['home', 'course', 'workshop', 'landing']),
  template: pageTemplateSchema.optional(),
  sections: z
    .array(
      z.object({
        id: z.string().min(1).max(200),
        label: z.string().min(1).max(240),
        blockType: z.enum(blockTypes).optional(),
        placement: z.string().min(1).max(220).optional(),
        itemIds: z.array(z.string().uuid()).max(maxBlockItems).optional(),
        fields: z
          .array(
            z.object({
              id: z.string().min(1).max(200),
              label: z.string().min(1).max(500),
              kind: z.enum(['text', 'multiline', 'image']),
              value: z.string().max(50000),
              style: styleSchema.optional(),
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
  const native = page.sections.filter((section) => !section.blockType);
  if (
    page.path !== baseline.path ||
    page.kind !== baseline.kind ||
    page.template !== baseline.template ||
    native.length < baseline.sections.length ||
    (seeded && native.length !== baseline.sections.length) ||
    native.some(
      (section, index) =>
        section !== page.sections[index] ||
        section.itemIds !== undefined ||
        section.placement !== undefined,
    ) ||
    new Set(page.sections.map((s) => s.id)).size !== page.sections.length
  )
    throw invalid();
  const allowedPlacements = new Set(pagePlacements(page).map(({ id }) => id));
  for (const [index, section] of page.sections.entries()) {
    if (section.fields.some((field) => field.style && !isStylableField(field)))
      throw new HttpError(400, 'Форматування доступне лише для видимого тексту.');
    if (section.blockType) {
      if (section.placement !== undefined && !allowedPlacements.has(section.placement))
        throw new HttpError(400, 'Оберіть доступне місце для блоку на цій сторінці.');
      validateBlock(section, publishing, validateImage);
      continue;
    }
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
