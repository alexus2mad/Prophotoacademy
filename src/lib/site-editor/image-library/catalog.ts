import type { SitePage } from '../types';
import type { LibraryImage } from './types';

export function academyImages(pages: SitePage[], query: string): LibraryImage[] {
  const found = new Map<string, LibraryImage>();
  const term = query.toLocaleLowerCase('uk');
  for (const page of pages) {
    for (const section of page.sections) {
      const text = new Map(
        section.fields
          .filter((field) => field.kind === 'text')
          .map((field) => [field.id, field.value]),
      );
      for (const field of section.fields) {
        if (field.kind !== 'image') continue;
        const url = field.value;
        if (
          !/^\/(?:images|design|brand)\/[\w./-]+\.(?:webp|avif|jpe?g|png)$/i.test(url) ||
          url.includes('..') ||
          found.has(url)
        )
          continue;
        const alt =
          text.get(field.id + '-alt') ||
          text.get(field.id.replace(/-image$/, '-alt')) ||
          (field.id === 'image' ? text.get('alt') : '');
        const context = page.title + ' · ' + section.label;
        const name = alt || field.label;
        if ((name + ' ' + context + ' ' + url).toLocaleLowerCase('uk').includes(term))
          found.set(url, { url, name, context });
      }
    }
  }
  return Array.from(found.values());
}
