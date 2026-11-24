import { createHash } from 'node:crypto';
import { createClient } from '@sanity/client';
import { HttpError } from '../../http';
import { findWorkshopOffer } from '../../commerce/workshop-offers';
import { getSiteSeeds } from '../seeds';
import {
  contentSyncRole,
  marketingClient,
  marketingImagePrefix,
  productionEditorOrigin,
  stagingMarketingSource,
} from '../storage/config';
import { editorStates, siteEditorWritable } from '../storage/repository';
import { currentTarget } from '../storage/target';
import { writeSitePage } from '../store';
import type { SitePage } from '../types';
import { pageSchema } from '../validation';
import { assetId, compareWithProduction, rewriteForProduction } from './compare';
import type {
  StagingAsset,
  StagingRecord,
  SyncAddresses,
  SyncCandidate,
  SyncOverview,
} from './types';

const maxPhotoBytes = 12 * 1024 * 1024;
const uncached = { cache: 'no-store' } as const;
const stagingImages = `https://cdn.sanity.io/images/${stagingMarketingSource.projectId}/${stagingMarketingSource.dataset}/`;

function requireProduction() {
  if (
    contentSyncRole() !== 'production' ||
    currentTarget() !== 'production' ||
    !siteEditorWritable()
  )
    throw new HttpError(404, 'Синхронізація доступна лише в редакторі продакшну.');
  const toImages = marketingImagePrefix();
  if (!toImages) throw new HttpError(503, 'Сховище контенту продакшну не налаштовано.');
  const addresses: SyncAddresses = {
    fromImages: stagingImages,
    toImages,
    fromOrigin: stagingMarketingSource.origin,
    toOrigin: productionEditorOrigin,
  };
  return addresses;
}

// Anonymous: staging publishes these documents publicly; drafts stay unreadable.
function stagingClient() {
  return createClient({
    projectId: stagingMarketingSource.projectId,
    dataset: stagingMarketingSource.dataset,
    apiVersion: '2026-10-01',
    useCdn: false,
    perspective: 'published',
  });
}

async function stagingRecords(path?: string) {
  const filter = path ? ' && path == $path' : '';
  return stagingClient().fetch<StagingRecord[]>(
    `*[_type == "academySitePage" && !(_id in path("drafts.**"))${filter}] | order(path asc){path,page}`,
    { path: path || '' },
    uncached,
  );
}

const digest = (record: StagingRecord) =>
  createHash('sha256').update(JSON.stringify(record.page)).digest('hex');

async function productionAssets(files: string[]) {
  if (!files.length) return new Set<string>();
  const ids = await marketingClient(true).fetch<string[]>(
    '*[_id in $ids]._id',
    { ids: files.map(assetId) },
    uncached,
  );
  return new Set(ids);
}

function ticketFor(page: SitePage) {
  const offer = page.offerId && findWorkshopOffer(page.path);
  if (!offer || offer.offering.id !== page.offerId) return undefined;
  return { label: offer.program.title, prices: offer.offering.packages.map((pack) => pack.price) };
}

export async function syncOverview(): Promise<SyncOverview> {
  const addresses = requireProduction();
  const [records, seeds, states] = await Promise.all([
    stagingRecords(),
    getSiteSeeds(),
    editorStates(),
  ]);
  const stored = new Map(states.map((state) => [state.path, state]));
  const candidates: SyncCandidate[] = [];
  let identical = 0;
  for (const record of records) {
    const state = stored.get(record.path);
    const current = state?.published ?? seeds.find((seed) => seed.path === record.path) ?? null;
    const production = current ? pageSchema.parse(current) : null;
    const base = {
      path: record.path,
      productionDraft: Boolean(state?.draft),
      stagingDigest: digest(record),
      revision: state?.revision ?? null,
    };
    try {
      const { page, files } = rewriteForProduction(pageSchema.parse(record.page), addresses);
      const changes = compareWithProduction(page, production);
      if (!changes) {
        identical++;
        continue;
      }
      const present = await productionAssets(files);
      candidates.push({
        ...base,
        title: page.title,
        kind: page.kind,
        status: production ? 'changed' : 'new',
        changes,
        photos: files.filter((file) => !present.has(assetId(file))).length,
        ticket: ticketFor(page),
      });
    } catch (error) {
      const page = record.page as Partial<SitePage> | null;
      candidates.push({
        ...base,
        title: page?.title || record.path,
        kind: page?.kind ?? 'landing',
        status: production ? 'changed' : 'new',
        changes: { title: false, added: [], removed: [], changed: [] },
        photos: 0,
        problem: error instanceof HttpError ? error.message : 'Сторінка не пройшла перевірку.',
      });
    }
  }
  return { candidates, identical };
}

async function copyPhoto(file: string, originalFilename?: string) {
  const response = await fetch(stagingImages + file, { cache: 'no-store' });
  const type = response.headers.get('content-type') || '';
  const size = Number(response.headers.get('content-length') || 0);
  if (!response.ok || !type.startsWith('image/') || size > maxPhotoBytes)
    throw new HttpError(502, 'Не вдалося отримати фото зі staging.');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > maxPhotoBytes) throw new HttpError(502, 'Фото зі staging завелике.');
  const asset = await marketingClient(true).assets.upload('image', bytes, {
    filename: originalFilename || file,
    contentType: type,
  });
  // Sanity derives the asset ID from the bytes. Any other ID means a different photograph.
  if (asset._id !== assetId(file))
    throw new HttpError(502, 'Фото зі staging не збігається з оригіналом.');
}

export async function syncPage(path: string, stagingDigest: string, revision: string | null) {
  const addresses = requireProduction();
  const [record] = await stagingRecords(path);
  if (!record) throw new HttpError(404, 'На staging немає опублікованої сторінки з цією адресою.');
  if (digest(record) !== stagingDigest)
    throw new HttpError(409, 'Сторінка на staging змінилася. Оновіть список змін.');
  const { page, files } = rewriteForProduction(pageSchema.parse(record.page), addresses);
  const present = await productionAssets(files);
  const missing = files.filter((file) => !present.has(assetId(file)));
  if (missing.length) {
    const names = await stagingClient().fetch<StagingAsset[]>(
      '*[_id in $ids]{_id,originalFilename}',
      { ids: missing.map(assetId) },
      uncached,
    );
    const original = new Map(names.map((asset) => [asset._id, asset.originalFilename]));
    for (const file of missing) await copyPhoto(file, original.get(assetId(file)));
  }
  return writeSitePage(page, revision, true);
}
