// Explicit media maintenance only: node scripts/prepare-food-course-images.mjs [sourceDirectory]
// Reads scripts/food-course-images.json, writes hashed WebP files to public/images/studio/food/,
// the manifest to src/lib/studio-food/images.json and a contact sheet to .data/food-images/.
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const selection = JSON.parse(
  await readFile(path.join(root, 'scripts/food-course-images.json'), 'utf8'),
);
const sourceDirectory = path.resolve(root, process.argv[2] ?? selection.sourceDirectory);
const outputDirectory = path.join(root, 'public/images/studio', selection.page);
const manifestPath = path.join(root, 'src/lib/studio-food/images.json');
const reportDirectory = path.join(root, '.data', selection.page + '-images');
const limits = { hero: { width: 2560 }, card: { long: 1200 }, work: { long: 1440 } };
const quality = { hero: 76, card: 80, work: 76 };
const produced = /^[a-z0-9-]+-[0-9a-f]{12}\.webp$/;

await mkdir(outputDirectory, { recursive: true });
await mkdir(path.dirname(manifestPath), { recursive: true });
await mkdir(reportDirectory, { recursive: true });

const manifest = [];
const written = new Set();
const rows = [];
for (const image of selection.images) {
  const original = await readFile(path.join(sourceDirectory, image.source));
  let pipeline = sharp(original).rotate();
  if (image.crop) pipeline = sharp(await pipeline.toBuffer()).extract(image.crop);
  const limit = limits[image.role];
  pipeline = limit.width
    ? pipeline.resize({ width: limit.width, withoutEnlargement: true })
    : pipeline.resize({
        width: limit.long,
        height: limit.long,
        fit: 'inside',
        withoutEnlargement: true,
      });
  const { data, info } = await pipeline
    .webp({ quality: quality[image.role], effort: 6 })
    .toBuffer({ resolveWithObject: true });
  const hash = createHash('sha256').update(data).digest('hex').slice(0, 12);
  const name = `${image.id}-${hash}.webp`;
  await writeFile(path.join(outputDirectory, name), data);
  written.add(name);
  manifest.push({
    id: image.id,
    src: `/images/studio/${selection.page}/${name}`,
    width: info.width,
    height: info.height,
    alt: image.alt,
    device: image.device,
    role: image.role,
    position: image.position ?? '50% 50%',
  });
  rows.push({ id: image.id, role: image.role, source: image.source, data, info });
}

for (const name of await readdir(outputDirectory)) {
  if (produced.test(name) && !written.has(name)) await rm(path.join(outputDirectory, name));
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// Contact sheet: each pick as a 4:5 cover thumbnail at its recorded focal point.
const tile = { width: 320, height: 400, label: 24 };
const columns = 6;
const composites = [];
for (const [index, row] of rows.entries()) {
  const entry = manifest[index];
  const focus = typeof entry.position === 'string' ? entry.position : entry.position.mobile;
  const [x, y] = focus.split(' ').map((value) => parseFloat(value) / 100);
  const scale = Math.max(tile.width / row.info.width, tile.height / row.info.height);
  const width = Math.ceil(row.info.width * scale);
  const height = Math.ceil(row.info.height * scale);
  const thumbnail = await sharp(row.data)
    .resize(width, height)
    .extract({
      left: Math.round((width - tile.width) * x),
      top: Math.round((height - tile.height) * y),
      width: tile.width,
      height: tile.height,
    })
    .toBuffer();
  const left = (index % columns) * tile.width;
  const top = Math.floor(index / columns) * (tile.height + tile.label);
  const label = `${index}. ${row.role} ${row.id}`.replace(/[<&>]/g, '');
  composites.push({ input: thumbnail, left, top });
  composites.push({
    input: Buffer.from(
      `<svg width="${tile.width}" height="${tile.label}"><rect width="100%" height="100%" fill="#111"/><text x="6" y="17" font-family="Arial" font-size="13" fill="#eee">${label}</text></svg>`,
    ),
    left,
    top: top + tile.height,
  });
}
await sharp({
  create: {
    width: columns * tile.width,
    height: Math.ceil(rows.length / columns) * (tile.height + tile.label),
    channels: 3,
    background: '#111',
  },
})
  .composite(composites)
  .jpeg({ quality: 82 })
  .toFile(path.join(reportDirectory, 'contact-sheet.jpg'));

const total = rows.reduce((sum, row) => sum + row.data.length, 0);
for (const row of rows)
  console.log(
    `${row.role.padEnd(5)} ${row.id.padEnd(28)} ${row.info.width}x${row.info.height} ${Math.round(row.data.length / 1024)} KB  <- ${row.source}`,
  );
console.log(`Prepared ${rows.length} food course images (${Math.round(total / 1024)} KB total).`);
