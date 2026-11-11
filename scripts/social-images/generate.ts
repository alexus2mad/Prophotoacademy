import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import content from '../../content/academy.json';
import { socialCards } from './catalog';
import { renderSocialCard } from './render';
import type { SocialImageEntry } from '../../src/lib/social-images/types';

const root = process.cwd();
const directory = path.join(root, 'public/social');
const manifestFile = path.join(root, 'src/lib/social-images/images.json');
const fingerprintFile = path.join(root, 'src/lib/social-images/source-fingerprint.json');
const hash = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');
const keys = new Set(socialCards.map((card) => card.path));
if (keys.size !== socialCards.length) throw new Error('Duplicate social card paths');
for (const page of [...content.programs, ...content.pages]) {
  if (!keys.has(`/${page.slug}`)) throw new Error(`Missing social card for /${page.slug}`);
}
const inputs = new Set([
  'scripts/social-images/catalog.ts',
  'scripts/social-images/render.ts',
  'scripts/social-images/kyivtype-regular.ttf',
  'src/app/fonts/studio-roboto-condensed.ttf',
  'public/design/studio/components-logo-academy-41f1d5b9e2.svg',
  'public/design/studio/components-logo-studio-70330e24ac.svg',
  'public/design/studio/components-logo-shop-41aaeadcfd.svg',
  'public/brand/prophoto-icon.svg',
  ...socialCards.flatMap((card) => card.photos.map((photo) => `public${photo.src}`)),
]);
const fingerprint = createHash('sha256').update(JSON.stringify(socialCards));
for (const file of [...inputs].sort()) {
  const bytes = await readFile(path.join(root, file));
  // Git uses LF; a Windows checkout may use CRLF without changing the artwork.
  fingerprint
    .update(file)
    .update(/\.(ts|tsx|svg)$/.test(file) ? bytes.toString('utf8').replace(/\r\n/g, '\n') : bytes);
}
const sourceHash = fingerprint.digest('hex');

if (process.argv.includes('--check')) {
  const saved = JSON.parse(await readFile(fingerprintFile, 'utf8'));
  if (saved.sha256 !== sourceHash)
    throw new Error(
      'Social image inputs changed. Run pnpm social:generate and review the artwork.',
    );
  const manifest: Record<string, SocialImageEntry> = JSON.parse(
    await readFile(manifestFile, 'utf8'),
  );
  if (Object.keys(manifest).length !== keys.size)
    throw new Error('Social image manifest coverage differs from source');
  for (const key of keys) {
    const entry = manifest[key];
    if (!entry || entry.images.length !== 2) throw new Error(`Missing image variants: ${key}`);
    for (const [index, image] of entry.images.entries()) {
      if (!/^\/social\/[a-z0-9-]+-[a-f0-9]{12}-(wide|square)\.jpg$/.test(image.src))
        throw new Error('Invalid social image filename');
      const buffer = await readFile(path.join(root, 'public', image.src));
      const info = await sharp(buffer).metadata();
      if (
        hash(buffer) !== image.sha256 ||
        buffer.length > 300_000 ||
        info.format !== 'jpeg' ||
        info.width !== (index === 0 ? 1200 : 630) ||
        info.height !== 630
      )
        throw new Error(`Invalid social image: ${image.src}`);
    }
  }
  console.log(
    `Verified ${keys.size} page cards / ${keys.size * 2} JPEGs: current sources, dimensions, checksums and 300 KB budget`,
  );
} else {
  await mkdir(directory, { recursive: true });
  const manifest: Record<string, SocialImageEntry> = {};
  for (const card of socialCards) {
    const entry: SocialImageEntry = {
      title: card.title,
      description: card.description,
      images: [],
    };
    for (const square of [false, true]) {
      const buffer = await renderSocialCard(card, square);
      const digest = hash(buffer);
      const name = `${card.path === '/' ? 'home' : card.path.slice(1).replaceAll('/', '-')}-${digest.slice(0, 12)}-${square ? 'square' : 'wide'}.jpg`;
      await writeFile(path.join(directory, name), buffer);
      const subject = card.photos.length
        ? ` — ${card.photos.map((photo) => photo.alt).join('; ')}`
        : '';
      entry.images.push({
        src: `/social/${name}`,
        width: square ? 630 : 1200,
        height: 630,
        alt: `${card.title} · ProPhoto${subject}`,
        sha256: digest,
        bytes: buffer.length,
      });
    }
    manifest[card.path] = entry;
    console.log(`Prepared ${card.path}`);
  }
  await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(fingerprintFile, JSON.stringify({ sha256: sourceHash }, null, 2) + '\n');
  console.log(`Prepared ${keys.size} page cards / ${keys.size * 2} JPEGs`);
}
