import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Remove unused export-artboard margins, keeping the supplied vector artwork intact.
const manifest = [];
for (const name of ['prophoto-study', 'prophoto']) {
  const path = `public/brand/${name}.svg`;
  const source = await readFile(path, 'utf8');
  const { data, info } = await sharp(Buffer.from(source))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width,
    top = info.height,
    right = 0,
    bottom = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 0) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  const box = [Math.max(0, left - 4), Math.max(0, top - 4), right - left + 9, bottom - top + 9];
  const trimmed = source
    .replace(/viewBox="[^"]+"/, `viewBox="${box.join(' ')}"`)
    .replace(/width="[^"]+"/, '')
    .replace(/height="[^"]+"/, '');
  await writeFile(`public/brand/${name}-trimmed.svg`, trimmed);
  await sharp(Buffer.from(trimmed))
    .resize({ width: 600 })
    .png()
    .toFile(`content/source/brand/${name}-preview.png`);
  manifest.push({ name, source: path, display: `public/brand/${name}-trimmed.svg`, viewBox: box });
}
await writeFile('content/source/brand/display-manifest.json', JSON.stringify(manifest, null, 2));
console.log(manifest);
