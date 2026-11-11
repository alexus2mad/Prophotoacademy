import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import sharp from 'sharp';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'pages-out');
const prefix = process.env.PAGES_BASE_PATH || '/Prophotoacademy';
const origin = new URL(process.env.PAGES_ORIGIN || 'https://alexus2mad.github.io').origin;
const errors = [];
const inspectedImages = new Map();
let pages = 0;

async function inspectSocialMetadata($, file) {
  for (const selector of [
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:image:alt"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
    'meta[name="twitter:image:alt"]',
  ]) {
    if (!$(selector).attr('content')?.trim())
      errors.push('Missing social metadata ' + selector + ': ' + file);
  }
  if ($('meta[name="twitter:card"]').attr('content') !== 'summary_large_image')
    errors.push('Missing large Twitter card: ' + file);

  const imageUrls = $('meta[property="og:image"]')
    .toArray()
    .map((element) => $(element).attr('content'));
  if (imageUrls.length !== 2) errors.push('Expected wide and square social images: ' + file);
  if ($('meta[name="twitter:image"]').first().attr('content') !== imageUrls[0])
    errors.push('Twitter and Open Graph primary images differ: ' + file);
  const widths = $('meta[property="og:image:width"]').toArray();
  const heights = $('meta[property="og:image:height"]').toArray();

  for (const [index, value] of imageUrls.entries()) {
    try {
      const url = new URL(value);
      if (
        url.origin !== origin ||
        !url.pathname.startsWith(prefix + '/social/') ||
        url.search ||
        url.hash
      ) {
        errors.push('Invalid review social image URL: ' + value);
        continue;
      }
      const name = url.pathname.slice((prefix + '/social/').length);
      if (!/^[a-z0-9-]+-(wide|square)\.jpg$/.test(name)) {
        errors.push('Unexpected social image filename: ' + value);
        continue;
      }
      const target = path.join(output, 'social', name);
      if (!inspectedImages.has(target)) {
        const image = await readFile(target);
        inspectedImages.set(target, { ...(await sharp(image).metadata()), bytes: image.length });
      }
      const image = inspectedImages.get(target);
      const expectedWidth = index === 0 ? 1200 : 630;
      if (
        image.format !== 'jpeg' ||
        image.width !== expectedWidth ||
        image.height !== 630 ||
        image.bytes > 300000
      )
        errors.push('Invalid social image dimensions, format or byte budget: ' + value);
      if (
        $(widths[index]).attr('content') !== String(expectedWidth) ||
        $(heights[index]).attr('content') !== '630'
      )
        errors.push('Social image dimensions do not match metadata: ' + value);
    } catch (error) {
      errors.push('Unreadable social image ' + value + ': ' + error.message);
    }
  }
}

async function inspect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await inspect(file);
    else if (entry.name.endsWith('.html')) {
      pages++;
      const html = await readFile(file, 'utf8');
      const $ = load(html);
      await inspectSocialMetadata($, file);
      if (!$('meta[name="robots"]').attr('content')?.includes('noindex'))
        errors.push('Missing noindex: ' + file);
      if (!$('.review-notice').length) errors.push('Missing review notice: ' + file);
      for (const rel of ['icon', 'apple-touch-icon']) {
        if (!$(`link[rel="${rel}"][href]`).length) errors.push('Missing ' + rel + ': ' + file);
      }
      for (const element of $('img[src],script[src],link[href]').toArray()) {
        const value = $(element).attr('src') || $(element).attr('href');
        if (!value?.startsWith('/')) continue;
        if (!value.startsWith(prefix + '/')) {
          errors.push('Unprefixed asset: ' + value);
          continue;
        }
        const asset = value.slice(prefix.length).split('?')[0];
        if (!asset.startsWith('/_next') && !/\.(webp|svg|png|ico|woff2|css|js)$/.test(asset))
          continue;
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
for (const privatePath of [
  'api',
  'operations',
  'studio',
  'learn',
  'admin/courses',
  'account/purchases',
  '.data',
]) {
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
  'demo/account',
  'demo/learn/visual-language',
  'demo/admin/courses/instagram',
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
    ' review pages: prefixed assets, branded social images, noindex, clear review notices and no private endpoints.',
);
