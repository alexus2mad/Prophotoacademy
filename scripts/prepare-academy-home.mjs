// Explicit media maintenance only. Builds use the committed, hashed image variants.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const root = fileURLToPath(new URL('../', import.meta.url));
const sources = JSON.parse(
  await readFile(root + 'content/source/academy-home-photos.json', 'utf8'),
);
const photos = JSON.parse(await readFile(root + 'src/lib/photography/home-images.json', 'utf8'));
const manifest = {};
for (const source of sources) {
  const response = await fetch(source.source);
  if (!response.ok) throw new Error('Cannot retrieve ' + source.id + ': ' + response.status);
  const original = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(original).metadata();
  const maximum = source.id === 'hero' ? 2400 : source.id === 'founder' ? 1600 : 1200;
  const widths = [
    ...new Set(
      [480, 840, 1200, 1600, 2400]
        .filter((w) => w <= maximum)
        .map((w) => Math.min(w, metadata.width)),
    ),
  ];
  const variants = [];
  for (const width of widths) {
    const output = await sharp(original)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: source.id === 'hero' ? 85 : 84, effort: 6 })
      .toBuffer();
    const hash = createHash('sha256').update(output).digest('hex').slice(0, 12);
    const src = '/images/hero/home-' + source.id + '-' + hash + '-' + width + '.webp';
    await writeFile(root + 'public' + src, output);
    variants.push({ src, width });
  }
  Object.assign(photos[source.id], {
    src: variants.at(-1).src,
    width: metadata.width,
    height: metadata.height,
  });
  manifest[photos[source.id].src] = variants;
}
await writeFile(
  root + 'src/lib/photography/home-images.json',
  JSON.stringify(photos, null, 2) + '\n',
);
await writeFile(
  root + 'src/lib/photography/prepared-home-images.json',
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log('Prepared Academy homepage originals and responsive variants.');
