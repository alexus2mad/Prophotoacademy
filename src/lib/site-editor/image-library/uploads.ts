import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { editorMode, localDirectory, marketingClient } from '../storage/config';
import type { LibraryImage, SanityLibraryResult } from './types';

export function uploadName(filename?: string) {
  const base = (filename || '')
    .split(/[\\/]/)
    .pop()
    ?.replace(/\.[^.]+$/, '')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N} _().-]/gu, ' ')
    .trim()
    .slice(0, 100);
  return !base || /^[a-f0-9]{40,}$/i.test(base) ? 'Завантажене фото' : base;
}

async function localUploads(query: string, offset: number, limit: number) {
  const dir = path.join(localDirectory(), 'images');
  const entries = await readdir(dir, { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    },
  );
  const files = await Promise.all(
    entries
      .filter((e) => e.isFile() && /^[a-f0-9]{64}\.webp$/.test(e.name))
      .map(async (e) => {
        const id = e.name.slice(0, -5);
        const [name, info] = await Promise.all([
          readFile(path.join(dir, id + '.name'), 'utf8').catch((error: NodeJS.ErrnoException) => {
            if (error.code === 'ENOENT') return 'Завантажене фото';
            throw error;
          }),
          stat(path.join(dir, e.name)),
        ]);
        return {
          url: '/api/site-content/images/' + id,
          name,
          context: 'Завантаження',
          time: info.mtimeMs,
        };
      }),
  );
  const matching = files
    .filter((asset) => asset.name.toLocaleLowerCase('uk').includes(query.toLocaleLowerCase('uk')))
    .sort((a, b) => b.time - a.time || a.url.localeCompare(b.url));
  return {
    total: matching.length,
    images: matching
      .slice(offset, offset + limit)
      .map(({ url, name, context }) => ({ url, name, context })),
  };
}

export async function uploadedImages(query: string, offset: number, limit: number) {
  if (editorMode() === 'local') return localUploads(query, offset, limit);
  const filter =
    '*[_type == "sanity.imageAsset" && mimeType in ["image/jpeg","image/png","image/webp","image/avif"] && ($q == "" || count(string::split(lower(coalesce(originalFilename,"")), $q)) > 1)]';
  const result = await marketingClient(true).fetch<SanityLibraryResult>(
    '{"total":count(' +
      filter +
      '),"assets":' +
      filter +
      ' | order(_createdAt desc, _id asc)[$start...$end]{url,originalFilename,metadata{dimensions{width,height}}}}',
    { q: query.toLocaleLowerCase('uk'), start: offset, end: offset + limit },
    { cache: 'no-store' },
  );
  const images: LibraryImage[] = result.assets.map((asset) => {
    const d = asset.metadata?.dimensions;
    return {
      url: asset.url,
      name: uploadName(asset.originalFilename),
      context: d ? d.width + ' × ' + d.height : 'Завантаження',
    };
  });
  return { total: result.total, images };
}
