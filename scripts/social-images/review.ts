import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { OverlayOptions } from 'sharp';
import type { SocialImageEntry } from '../../src/lib/social-images/types';

const root = process.cwd();
const output = path.join(root, '.data/social-images');
await mkdir(output, { recursive: true });
const manifest: Record<string, SocialImageEntry> = JSON.parse(
  await readFile('src/lib/social-images/images.json', 'utf8'),
);
const entries = Object.entries(manifest);
const cards: string[] = [];
for (let page = 0; page < Math.ceil(entries.length / 6); page++) {
  const batch = entries.slice(page * 6, page * 6 + 6);
  const layers: OverlayOptions[] = [];
  for (const [index, [route, entry]] of batch.entries()) {
    const top = index * 365;
    const label = await sharp({
      text: {
        text: route,
        font: 'Roboto Condensed Bold 22',
        fontfile: 'src/app/fonts/studio-roboto-condensed.ttf',
        rgba: true,
      },
    })
      .png()
      .toBuffer();
    layers.push({ input: label, left: 20, top: top + 12 });
    for (const [variant, image] of entry.images.entries()) {
      const file = path.join(root, 'public', image.src);
      layers.push({
        input: await sharp(file)
          .resize(variant === 0 ? 600 : 315, 315)
          .png()
          .toBuffer(),
        left: variant === 0 ? 20 : 635,
        top: top + 42,
      });
    }
  }
  await sharp({
    create: { width: 970, height: batch.length * 365 + 12, channels: 3, background: '#e9e6e2' },
  })
    .composite(layers)
    .png()
    .toFile(path.join(output, `all-images-${page + 1}.png`));
}
for (const [route, entry] of entries) {
  const imageTags = await Promise.all(
    entry.images.map(async (image) => {
      const buffer = await readFile(path.join(root, 'public', image.src));
      return `<a href="data:image/jpeg;base64,${buffer.toString('base64')}" download="${path.basename(image.src)}"><img src="data:image/jpeg;base64,${buffer.toString('base64')}" width="${image.width}" height="${image.height}" alt="${route} ${image.width} × ${image.height}"><small>${image.width} × ${image.height} · ${Math.round(image.bytes / 1024)} KB</small></a>`;
    }),
  );
  cards.push(`<section><h2>${route}</h2><div>${imageTags.join('')}</div></section>`);
}
await writeFile(
  path.join(output, 'index.html'),
  `<!doctype html><html lang="uk"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ProPhoto — усі соціальні зображення</title><style>body{margin:0;padding:32px;background:#e9e6e2;color:#150b08;font:16px Arial,sans-serif}main{max-width:1200px;margin:auto}h1{font-size:32px}h2{font-size:18px;margin:32px 0 12px}section div{display:grid;grid-template-columns:1200fr 630fr;gap:24px;align-items:start}a{color:inherit;text-decoration:none}img{display:block;width:100%;height:auto}small{display:block;margin-top:8px}@media(max-width:700px){body{padding:16px}section div{grid-template-columns:1fr}section a:last-child{max-width:320px}}</style><main><h1>ProPhoto — ${entries.length} сторінки, ${entries.length * 2} зображень</h1><p>Широкий формат 1200 × 630 та квадратний 630 × 630. Натисніть зображення, щоб зберегти оригінал.</p>${cards.join('')}</main></html>`,
);
console.log(
  `Saved all ${entries.length * 2} images in .data/social-images/index.html and six review sheets`,
);
