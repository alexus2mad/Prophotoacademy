// Email clients block SVG, so transactional emails use a light PNG of the
// Study logo, matching the inverted logo in the site header.
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
const svg = (await readFile('public/brand/prophoto-study-trimmed.svg', 'utf8')).replace(
  /fill:\s*#010101/g,
  'fill: #f2efe7',
);
await sharp(Buffer.from(svg), { density: 300 })
  .resize({ width: 600 })
  .png({ compressionLevel: 9 })
  .toFile('public/brand/prophoto-study-email.png');
console.log('public/brand/prophoto-study-email.png');
