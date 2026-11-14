import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { OverlayOptions } from 'sharp';
import type { ArtworkLayer, SocialCard, SocialPhoto, TextStyle } from './types';

const paper = '#fbfbfb';
const red = '#eb423b';
const root = process.cwd();
const fonts = {
  heading: { file: 'src/app/fonts/studio-roboto-condensed.ttf', family: 'Roboto Condensed Bold' },
  body: { file: 'scripts/social-images/kyivtype-regular.ttf', family: 'KyivType Sans' },
};

function escapeMarkup(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]!,
  );
}

async function textImage(value: string, style: TextStyle) {
  const font = fonts[style.font];
  const raster = await sharp({
    text: {
      text: `<span foreground="${style.color}">${escapeMarkup(value)}</span>`,
      font: `${font.family} ${style.size}`,
      fontfile: path.join(root, font.file),
      rgba: true,
    },
  })
    .png()
    .toBuffer();
  const info = await sharp(raster).metadata();
  if (style.maxWidth && info.width! > style.maxWidth) {
    return textImage(value, { ...style, size: style.size - 1 });
  }
  return { input: raster, width: info.width!, height: info.height! };
}

function rectangle(width: number, height: number, color: string) {
  return Buffer.from(
    `<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/></svg>`,
  );
}

async function photograph(photo: SocialPhoto, width: number, height: number, square = false) {
  if (!/^\/(images|design)\/[a-zA-Z0-9/_-]+\.(webp|png|jpg)$/.test(photo.src))
    throw new Error(`Social images accept reviewed public local photographs only: ${photo.src}`);
  const image = sharp(path.join(root, 'public', photo.src));
  const position = (square ? photo.squarePosition || photo.position : photo.position)?.match(
    /^(\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%$/,
  );
  if (position) {
    const info = await image.metadata();
    const scale = Math.max(width / info.width!, height / info.height!);
    const resizedWidth = Math.ceil(info.width! * scale);
    const resizedHeight = Math.ceil(info.height! * scale);
    return image
      .resize(resizedWidth, resizedHeight)
      .extract({
        width,
        height,
        left: Math.round(((resizedWidth - width) * Math.min(100, Number(position[1]))) / 100),
        top: Math.round(((resizedHeight - height) * Math.min(100, Number(position[2]))) / 100),
      })
      .toBuffer();
  }
  return image.resize(width, height, { fit: 'cover', position: 'attention' }).toBuffer();
}

async function logo(brand: SocialCard['brand'], width: number) {
  const file =
    brand === 'hub'
      ? 'components-logo-studio-70330e24ac.svg'
      : brand === 'shop'
        ? 'components-logo-shop-41aaeadcfd.svg'
        : 'components-logo-academy-41f1d5b9e2.svg';
  let svg = await readFile(path.join(root, 'public/design/studio', file), 'utf8');
  // Preserve the supplied vector shapes; use the brand's monochrome lockup.
  svg = svg
    .replace(/fill="white"/g, `fill="${paper}"`)
    .replace(/fill-opacity="0\.42"/g, 'fill-opacity="0.9"');
  return rasterLayer(await sharp(Buffer.from(svg)).resize({ width }).png().toBuffer());
}

async function rasterLayer(input: Buffer) {
  const { width, height } = await sharp(input).metadata();
  return { input, width: width!, height: height! };
}

function photoShade(
  width: number,
  height: number,
  copyTop: number,
  copyRight: number,
  strength: number,
) {
  const square = width === height;
  const toPercent = (y: number) => Math.min(100, Math.max(0, (100 * y) / height));
  // Keep the gradient behind the complete copy block, with a soft transition into the photo.
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="top" x2="0" y2="1">
          <stop stop-color="#080706" stop-opacity=".74"/>
          <stop offset=".11" stop-color="#080706" stop-opacity=".65"/>
          <stop offset=".25" stop-color="#080706" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="bottom" x2="0" y2="1">
          <stop offset="${toPercent(copyTop - 152)}%" stop-color="#080706" stop-opacity="0"/>
          <stop offset="${toPercent(copyTop + 3)}%" stop-color="#080706" stop-opacity="${strength}"/>
          <stop offset="1" stop-color="#080706" stop-opacity=".9"/>
        </linearGradient>
        <linearGradient id="bottomMask">
          <stop stop-color="white"/>
          <stop offset="${Math.min(0.75, (copyRight + 16) / width)}" stop-color="white"/>
          <stop offset=".99" stop-color="white" stop-opacity=".22"/>
        </linearGradient>
        <mask id="wideBottom"><rect width="100%" height="100%" fill="url(#bottomMask)"/></mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#top)"/>
      <rect width="100%" height="100%" fill="url(#bottom)" ${square ? '' : 'mask="url(#wideBottom)"'}/>
    </svg>`,
  );
}

const linear = Float64Array.from({ length: 256 }, (_, channel) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
});

function luminance(data: Buffer, index: number) {
  return (
    0.2126 * linear[data[index]] +
    0.7152 * linear[data[index + 1]] +
    0.0722 * linear[data[index + 2]]
  );
}

// Check picture pixels directly under the solid strokes, rather than an average over the crop.
async function copyContrast(background: Buffer, width: number, copy: ArtworkLayer[]) {
  const pixels = await sharp(background).removeAlpha().raw().toBuffer();
  let minimum = Infinity;
  for (const layer of copy) {
    const ink = await sharp(layer.input).ensureAlpha().raw().toBuffer();
    for (let y = 0; y < layer.height; y++)
      for (let x = 0; x < layer.width; x++) {
        const source = (y * layer.width + x) * 4;
        if (ink[source + 3] < 245) continue;
        const backdrop = ((layer.top + y) * width + layer.left + x) * 3;
        minimum = Math.min(
          minimum,
          (luminance(ink, source) + 0.05) / (luminance(pixels, backdrop) + 0.05),
        );
      }
  }
  return minimum;
}

async function headline(lines: string[], maxWidth: number, startSize: number) {
  for (let size = startSize; size >= 38; size--) {
    const rows = await Promise.all(
      lines.map((line) => textImage(line, { size, color: paper, font: 'heading' })),
    );
    if (rows.every((row) => row.width <= maxWidth)) return { rows, size };
  }
  throw new Error(`Social headline does not fit: ${lines.join(' ')}`);
}

export async function renderSocialCard(card: SocialCard, square = false) {
  const width = square ? 630 : 1200;
  const height = 630;
  const inset = square ? 42 : 56;
  const maxWidth = square ? width - inset * 2 : card.photos.length ? 650 : 960;
  if (card.photos.length > 1) throw new Error(`Choose one social hero photograph: ${card.path}`);

  const { rows, size } = await headline(
    card.lines,
    maxWidth,
    square ? (card.lines.length === 3 ? 70 : 76) : card.lines.length === 3 ? 84 : 96,
  );
  const subtitle = await textImage(card.subtitle, {
    size: square ? 23 : 26,
    color: paper,
    font: 'body',
    maxWidth,
  });
  const rowGap = square ? 5 : 7;
  const titleHeight = rows.reduce((sum, row) => sum + row.height, 0) + rowGap * (rows.length - 1);
  const subtitleTop = height - inset - subtitle.height;
  const titleTop = subtitleTop - (square ? 20 : 24) - titleHeight;
  const label = card.label
    ? await textImage(card.label, { size: square ? 17 : 19, color: paper, font: 'body', maxWidth })
    : null;
  const labelTop = titleTop - (label ? label.height + 22 : 0);
  const wordmark = await logo(card.brand, square ? 272 : 334);
  if (labelTop < inset + wordmark.height + 24)
    throw new Error(`Social copy overlaps its wordmark: ${card.path} (${size}px)`);

  const copy: ArtworkLayer[] = [{ ...wordmark, left: inset, top: inset }];
  const details: ArtworkLayer[] = [{ ...subtitle, left: inset, top: subtitleTop }];
  if (label) details.push({ ...label, left: inset, top: labelTop });
  let y = titleTop;
  for (const row of rows) {
    details.push({ ...row, left: inset, top: y });
    y += row.height + rowGap;
  }
  copy.push(...details);
  const copyRight = Math.max(...details.map(({ left, width }) => left + width));

  let background: Buffer;
  if (card.photos.length) {
    const photo = await photograph(card.photos[0], width, height, square);
    let readable: Buffer | undefined;
    for (const strength of [0.58, 0.67, 0.76, 0.85, 0.93]) {
      const shaded = await sharp(photo)
        .composite([
          { input: photoShade(width, height, labelTop, copyRight, strength), left: 0, top: 0 },
        ])
        .png()
        .toBuffer();
      if ((await copyContrast(shaded, width, copy)) >= 4.5) {
        readable = shaded;
        break;
      }
    }
    if (!readable) throw new Error(`Social copy needs a stronger treatment: ${card.path}`);
    background = readable;
  } else {
    // Utility and private cards use the same hierarchy without borrowing unrelated photography.
    const mark = await readFile(path.join(root, 'public/brand/prophoto-icon.svg'), 'utf8');
    const symbol = await sharp(Buffer.from(mark)).resize(280, 280).png().toBuffer();
    const faded = await sharp(symbol)
      .ensureAlpha()
      .linear([1, 1, 1, 0.09], [0, 0, 0, 0])
      .png()
      .toBuffer();
    background = await sharp({ create: { width, height, channels: 3, background: '#100d0c' } })
      .composite([{ input: faded, left: width - 298, top: 188 }])
      .png()
      .toBuffer();
  }

  const layers: OverlayOptions[] = [
    { input: rectangle(square ? 37 : 48, 4, red), left: inset, top: labelTop - 15 },
    ...copy.map(({ input, left, top }) => ({ input, left, top })),
  ];
  const raw = await sharp(background).composite(layers).png().toBuffer();
  for (const quality of [88, 83, 78, 72]) {
    const output = await sharp(raw)
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toBuffer();
    if (output.length <= 300_000) return output;
  }
  throw new Error(`Social image exceeds the 300 KB budget: ${card.path}`);
}
