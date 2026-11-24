import path from 'node:path';
import { createClient } from '@sanity/client';
import { HttpError } from '../../http';
import { currentTarget, runInTarget } from './target';
import type { EditorTarget } from './types';

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

const stagingScope = () => currentTarget() === 'staging';

function marketingProjectId() {
  if (stagingScope()) return stagingMarketingProject;
  return installationProjectId();
}

function installationProjectId() {
  if (isStaging() || isProductionAcademy()) return process.env.SITE_EDITOR_PROJECT_ID;
  return process.env.SITE_EDITOR_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
}

export function marketingImagePrefix() {
  if (!marketingDatasetConfigured()) return undefined;
  return `https://cdn.sanity.io/images/${marketingProjectId()}/${marketingDataset()}/`;
}

function marketingDataset() {
  return stagingScope() ? stagingMarketingDataset : process.env.NEXT_PUBLIC_SANITY_DATASET;
}

export function marketingWriteToken() {
  if (stagingScope())
    return stagingTargetAvailable() ? process.env.SITE_EDITOR_STAGING_WRITE_TOKEN : undefined;
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
  const dataset = marketingDataset();
  const readToken =
    stagingScope() || process.env.SITE_EDITOR_PROJECT_ID
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
  if (stagingScope()) return stagingTargetAvailable();
  return installationDatasetConfigured();
}

function installationDatasetConfigured() {
  if (isProductionAcademy() || process.env.SITE_EDITOR_PROJECT_ID === productionMarketingProject) {
    return (
      !isStaging() &&
      installationProjectId() === productionMarketingProject &&
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === productionLearningProject &&
      process.env.NEXT_PUBLIC_SANITY_DATASET === 'production' &&
      process.env.SANITY_LEARNING_DATASET === 'learning'
    );
  }
  if (isStaging()) {
    return (
      installationProjectId() === stagingMarketingProject &&
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

/** Staging's public marketing pages and assets, readable without credentials. */
const stagingMarketingDataset = 'production';
export const stagingMarketingSource = {
  projectId: stagingMarketingProject,
  dataset: stagingMarketingDataset,
  origin: stagingOrigin,
} as const;
export const productionEditorOrigin = productionOrigins[0];

/**
 * Production pulls staging content; staging only hands a page over to the production editor.
 * Staging never receives production credentials.
 */
export function contentSyncRole(): 'production' | 'staging' | null {
  if (editorMode() !== 'sanity' || !installationDatasetConfigured()) return null;
  if (isProductionAcademy() && installationProjectId() === productionMarketingProject)
    return 'production';
  if (isStaging() && installationProjectId() === stagingMarketingProject) return 'staging';
  return null;
}

/**
 * The production admin also manages staging content with a dedicated staging writer.
 * Staging itself never holds a production credential.
 */
export function stagingTargetAvailable() {
  const writer = process.env.SITE_EDITOR_STAGING_WRITE_TOKEN;
  const others = [
    process.env.SITE_EDITOR_WRITE_TOKEN,
    process.env.SANITY_LEARNING_WRITE_TOKEN,
    process.env.SANITY_API_WRITE_TOKEN,
    process.env.SANITY_API_READ_TOKEN,
  ];
  return contentSyncRole() === 'production' && !!writer && !others.includes(writer);
}

/** Staging writer for reading original photo bytes, which the public image CDN re-encodes. */
export function stagingAssetToken() {
  return stagingTargetAvailable() ? process.env.SITE_EDITOR_STAGING_WRITE_TOKEN : undefined;
}

/** Run editor storage work against one environment's marketing content. */
export function withEditorTarget<T>(target: EditorTarget, work: () => T): T {
  if (target === 'staging' && !stagingTargetAvailable())
    throw new HttpError(404, 'Керування staging недоступне в цьому редакторі.');
  return runInTarget(target, work);
}

export function unavailable() {
  return new HttpError(503, 'Збереження не налаштовано. Підключіть сховище публічного контенту.');
}

export function conflict() {
  return new HttpError(409, 'Сторінка змінилася. Оновіть версію перед повторним збереженням.');
}
