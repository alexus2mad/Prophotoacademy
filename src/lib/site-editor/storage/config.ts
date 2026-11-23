import path from 'node:path';
import { createClient } from '@sanity/client';
import { HttpError } from '../../http';

const stagingLearningProject = 'p0dn7nmp';
const stagingMarketingProject = '3k86g5dt';
const stagingLearning = 'learning-staging';
const stagingOrigin = 'https://staging.prophotoacademy.com.ua';
const productionMarketingProject = 'qy8emt0h';
const productionLearningProject = 'sfzp6094';
const productionOrigins = ['https://prophotoacademy.com.ua', 'https://www.prophotoacademy.com.ua'];

function isProductionAcademy() {
  return [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXT_PUBLIC_ACADEMY_URL].some(
    (origin) => origin && productionOrigins.includes(origin),
  );
}

function isStaging() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL === stagingOrigin ||
    process.env.NEXT_PUBLIC_ACADEMY_URL === stagingOrigin ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === stagingLearningProject ||
    process.env.SANITY_LEARNING_DATASET === stagingLearning
  );
}

function marketingProjectId() {
  if (isStaging() || isProductionAcademy()) return process.env.SITE_EDITOR_PROJECT_ID;
  return process.env.SITE_EDITOR_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
}

export function marketingImagePrefix() {
  if (!marketingDatasetConfigured()) return undefined;
  return `https://cdn.sanity.io/images/${marketingProjectId()}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/`;
}

export function marketingWriteToken() {
  const writer = process.env.SITE_EDITOR_WRITE_TOKEN;
  if (!isStaging() && !isProductionAcademy() && !process.env.SITE_EDITOR_PROJECT_ID)
    return writer || process.env.SANITY_API_WRITE_TOKEN;
  if (
    !marketingDatasetConfigured() ||
    (isStaging() && process.env.SANITY_API_WRITE_TOKEN) ||
    !writer ||
    writer === process.env.SANITY_LEARNING_WRITE_TOKEN ||
    writer === process.env.SANITY_API_WRITE_TOKEN
  )
    return undefined;
  return writer;
}

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
  const projectId = marketingProjectId();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const readToken = process.env.SITE_EDITOR_PROJECT_ID
    ? undefined
    : process.env.SANITY_API_READ_TOKEN;
  const token = write ? marketingWriteToken() : readToken;
  if (
    editorMode() !== 'sanity' ||
    !projectId ||
    !dataset ||
    !marketingDatasetConfigured() ||
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
  if (isProductionAcademy() || process.env.SITE_EDITOR_PROJECT_ID === productionMarketingProject) {
    return (
      !isStaging() &&
      marketingProjectId() === productionMarketingProject &&
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === productionLearningProject &&
      process.env.NEXT_PUBLIC_SANITY_DATASET === 'production' &&
      process.env.SANITY_LEARNING_DATASET === 'learning'
    );
  }
  if (isStaging()) {
    return (
      marketingProjectId() === stagingMarketingProject &&
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === stagingLearningProject &&
      process.env.NEXT_PUBLIC_SANITY_DATASET === 'production' &&
      process.env.SANITY_LEARNING_DATASET === stagingLearning
    );
  }
  return Boolean(
    !process.env.SITE_EDITOR_PROJECT_ID &&
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
