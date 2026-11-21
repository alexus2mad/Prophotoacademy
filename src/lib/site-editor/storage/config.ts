import path from 'node:path';
import { createClient } from '@sanity/client';
import { HttpError } from '../../http';

export function editorMode() {
  if (process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages') return 'readonly';
  const mode = process.env.SITE_EDITOR_MODE || 'readonly';
  if (mode === 'local' && process.env.NODE_ENV === 'production')
    throw new HttpError(503, 'Локальний редактор доступний лише для розробки.');
  if (mode !== 'sanity' && mode !== 'readonly' && mode !== 'local')
    throw new HttpError(503, 'Перевірте налаштування сховища редактора сайту.');
  return mode;
}

export function localDirectory() {
  if (editorMode() !== 'local') throw new HttpError(404, 'Файл не знайдено.');
  return path.resolve(process.env.SITE_EDITOR_LOCAL_DIR || '.data/site-editor');
}

export function marketingClient(write = false) {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = write ? process.env.SANITY_API_WRITE_TOKEN : process.env.SANITY_API_READ_TOKEN;
  if (
    editorMode() !== 'sanity' ||
    !projectId ||
    !dataset ||
    dataset === (process.env.SANITY_LEARNING_DATASET || 'learning') ||
    (write && !token)
  )
    throw unavailable();
  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2026-10-01',
    useCdn: false,
    perspective: write ? 'raw' : 'published',
  });
}

export function marketingDatasetConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET &&
      process.env.NEXT_PUBLIC_SANITY_DATASET !==
        (process.env.SANITY_LEARNING_DATASET || 'learning'),
  );
}

export function unavailable() {
  return new HttpError(503, 'Збереження не налаштовано. Підключіть сховище публічного контенту.');
}

export function conflict() {
  return new HttpError(409, 'Сторінка змінилася. Оновіть версію перед повторним збереженням.');
}
