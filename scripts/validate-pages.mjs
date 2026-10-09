import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'pages-out');
const prefix = process.env.PAGES_BASE_PATH || '/Prophotoacademy';
const errors = [];
let pages = 0;
async function inspect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await inspect(file);
    else if (entry.name.endsWith('.html')) {
      pages++;
      const html = await readFile(file, 'utf8');
      const $ = load(html);
      if (!$('meta[name="robots"]').attr('content')?.includes('noindex'))
        errors.push('Missing noindex: ' + file);
      if (!$('.review-notice').length) errors.push('Missing review notice: ' + file);
      for (const element of $('img[src],script[src],link[href]').toArray()) {
        const value = $(element).attr('src') || $(element).attr('href');
        if (!value?.startsWith('/')) continue;
        if (!value.startsWith(prefix + '/')) {
          errors.push('Unprefixed asset: ' + value);
          continue;
        }
        const asset = value.slice(prefix.length).split('?')[0];
        if (!asset.startsWith('/_next') && !/\.(webp|svg|woff2|css|js)$/.test(asset)) continue;
        try {
          await stat(path.join(output, decodeURIComponent(asset)));
        } catch {
          errors.push('Missing asset: ' + value);
        }
      }
    }
  }
}
await inspect(output);
for (const privatePath of ['api', 'operations', 'studio', '.data']) {
  try {
    await stat(path.join(output, privatePath));
    errors.push('Private path exported: ' + privatePath);
  } catch {}
}
for (const slug of [
  'course-smm-instagram',
  'visual-content',
  'food-product-photography',
  'courses',
  'hub',
  'hub/mainhall',
  'hub/booking',
  'hub/content-practice',
])
  try {
    await stat(path.join(output, slug, 'index.html'));
  } catch {
    errors.push('Missing review route: ' + slug);
  }
if (errors.length) throw new Error(errors.join('\n'));
console.log(
  'Validated ' +
    pages +
    ' review pages: prefixed assets, noindex, clear review notices and no private endpoints.',
);
