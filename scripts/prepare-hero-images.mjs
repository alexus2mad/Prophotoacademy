import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const content = JSON.parse(await readFile(path.join(root, 'content/academy.json'), 'utf8'));
const ids = new Set([
  'editorial-strawberry',
  'editorial-underwater',
  'visual',
  'editorial-portrait',
]);
for (const program of content.programs) {
  ids.add(program.imageId);
  const works = program.workIds.flatMap((id) => content.works.filter((work) => work.id === id));
  works
    .map((work) => work.imageId)
    .filter((id) => id !== program.imageId)
    .slice(0, 4)
    .forEach((id) => ids.add(id));
}
const directory = path.join(root, 'public/images/hero');
await mkdir(directory, { recursive: true });
const manifest = {};
let bytes = 0;
for (const image of content.images.filter((image) => ids.has(image.id))) {
  if (!/^\/images\/[a-z0-9-]+\.webp$/.test(image.src)) continue;
  const source = await readFile(path.join(root, 'public', image.src));
  const metadata = await sharp(source).metadata();
  const widths = [
    ...new Set([480, 640, 840, 1200, 1600].map((width) => Math.min(width, metadata.width))),
  ];
  manifest[image.src] = [];
  for (const width of widths) {
    const output = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 75, effort: 5 })
      .toBuffer();
    const hash = createHash('sha256').update(output).digest('hex').slice(0, 12);
    const name = path.basename(image.src, '.webp') + '-' + hash + '-' + width + '.webp';
    await writeFile(path.join(directory, name), output);
    manifest[image.src].push({ src: '/images/hero/' + name, width });
    bytes += output.length;
  }
}
await mkdir(path.join(root, 'src/lib/photography'), { recursive: true });
await writeFile(
  path.join(root, 'src/lib/photography/prepared-images.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(
  'Prepared ' +
    Object.keys(manifest).length +
    ' responsive hero photographs (' +
    Math.round(bytes / 1024) +
    ' KB total across all sizes).',
);
