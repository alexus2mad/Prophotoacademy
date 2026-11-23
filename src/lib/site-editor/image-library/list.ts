import { z } from 'zod';
import { getSiteSeeds } from '../seeds';
import { siteEditorWritable } from '../storage/repository';
import { unavailable } from '../storage/config';
import { academyImages } from './catalog';
import { uploadedImages } from './uploads';
import type { ImageLibraryFilter, ImageLibraryResult } from './types';

const batch = 24;
export function libraryFilter(params: URLSearchParams): ImageLibraryFilter {
  return {
    query: z
      .string()
      .trim()
      .max(120)
      .parse(params.get('q') || ''),
    offset: z.coerce
      .number()
      .int()
      .min(0)
      .max(1_000_000)
      .parse(params.get('offset') || 0),
    source: z.enum(['all', 'academy', 'uploads']).parse(params.get('source') || 'all'),
  };
}

export async function listLibraryImages({
  query,
  offset,
  source,
}: ImageLibraryFilter): Promise<ImageLibraryResult> {
  if (!siteEditorWritable()) throw unavailable();
  const [uploads, catalog] = await Promise.all([
    source === 'academy' ? { images: [], total: 0 } : uploadedImages(query, offset, batch),
    source === 'uploads' ? [] : getSiteSeeds().then((pages) => academyImages(pages, query)),
  ]);
  const start = Math.max(0, offset - uploads.total);
  const images = [
    ...uploads.images,
    ...catalog.slice(start, start + batch - uploads.images.length),
  ];
  const total = uploads.total + catalog.length;
  const next = offset + images.length;
  return { images, total, next: next < total ? next : null };
}
