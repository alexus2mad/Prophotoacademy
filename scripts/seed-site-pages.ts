import './environment';
import { loadSourceContent } from '../src/lib/content/source';
import { buildSiteSeeds } from '../src/lib/site-editor/seed-model';
import { pageSchema } from '../src/lib/site-editor/validation';
import { seedPublishedPages } from '../src/lib/site-editor/storage/repository';

const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--write')) throw new Error('Usage: site:seed [--write]');
const pages = buildSiteSeeds(await loadSourceContent(false)).map((page) => pageSchema.parse(page));
if (!pages.length || new Set(pages.map((page) => page.path)).size !== pages.length)
  throw new Error('Expected a nonempty list of unique page paths.');
if (!args.includes('--write')) {
  console.log('Validated seed pages. No writes requested:');
  for (const page of pages) console.log(page.path, page.title);
} else {
  const result = await seedPublishedPages(pages);
  console.log(
    'Seeded ' +
      result.inserted +
      ' pages. Preserved ' +
      result.preserved +
      ' existing pages or drafts.',
  );
}
