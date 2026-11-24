import { HttpError } from '../../http';
import { blockOutlineLabel } from '../block-label';
import type { SitePage } from '../types';
import type { SyncAddresses, SyncChanges } from './types';

const assetFile = /^[a-f0-9]+-\d+x\d+\.(?:webp|avif|jpe?g|png)$/;
// Payment terms and checkout links come from each environment's own server configuration.
const paymentProvider = /wayforpay\.com/i;

/** Sanity asset ID for a CDN file name, as the editor references it. */
export const assetId = (file: string) => 'image-' + file.replace('.', '-');

/**
 * Give staging content production addresses. Returns the staging photo files it references.
 * Content that would still point at staging or a payment provider is rejected.
 */
export function rewriteForProduction(page: SitePage, addresses: SyncAddresses) {
  const files = new Set<string>();
  const sections = page.sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => {
      if (field.kind === 'image' && field.value.startsWith(addresses.fromImages)) {
        const file = field.value.slice(addresses.fromImages.length).split('?')[0];
        if (!assetFile.test(file))
          throw new HttpError(400, 'Фото на staging має непідтримувану адресу.');
        files.add(file);
        return { ...field, value: addresses.toImages + file };
      }
      return { ...field, value: field.value.replaceAll(addresses.fromOrigin, addresses.toOrigin) };
    }),
  }));
  const result: SitePage = { ...page, sections };
  const text = JSON.stringify(result);
  if (
    text.includes(new URL(addresses.fromOrigin).host) ||
    text.includes(addresses.fromImages) ||
    paymentProvider.test(text)
  )
    throw new HttpError(
      400,
      'Сторінка містить адреси staging або платіжного сервісу. Приберіть їх на staging.',
    );
  return { page: result, files: Array.from(files).sort() };
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Differences between rewritten staging content and the current production page. */
export function compareWithProduction(
  staging: SitePage,
  production: SitePage | null,
): SyncChanges | null {
  if (production && same(staging, production)) return null;
  const before = new Map(production?.sections.map((s) => [s.id, s]));
  const after = new Map(staging.sections.map((s) => [s.id, s]));
  return {
    title: !!production && production.title !== staging.title,
    added: staging.sections.filter((s) => !before.has(s.id)).map(blockOutlineLabel),
    removed: (production?.sections ?? []).filter((s) => !after.has(s.id)).map(blockOutlineLabel),
    changed: staging.sections
      .filter((s) => before.has(s.id) && !same(s, before.get(s.id)))
      .map(blockOutlineLabel),
  };
}
