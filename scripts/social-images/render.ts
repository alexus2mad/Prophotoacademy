import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { OverlayOptions } from 'sharp';
import type { SocialCard, SocialPhoto, TextStyle } from './types';

const ink = '#150b08';
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
  if (square && photo.squareFit === 'contain')
    return image.resize(width, height, { fit: 'contain', background: '#303433' }).toBuffer();
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

async function logo(brand: SocialCard['brand'], light: boolean, width: number) {
  const file =
    brand === 'hub'
      ? 'components-logo-studio-70330e24ac.svg'
      : brand === 'shop'
        ? 'components-logo-shop-41aaeadcfd.svg'
        : 'components-logo-academy-41f1d5b9e2.svg';
  let svg = await readFile(path.join(root, 'public/design/studio', file), 'utf8');
  // Preserve the supplied vector shapes; use the brand's monochrome lockup.
  svg = svg
    .replace(/fill="white"/g, `fill="${light ? paper : ink}"`)
    .replace(/fill-opacity="0\.42"/g, 'fill-opacity="0.7"');
  return sharp(Buffer.from(svg)).resize({ width }).png().toBuffer();
}

export async function renderSocialCard(card: SocialCard, square = false) {
  const width = square ? 630 : 1200;
  const height = 630;
  const inset = square ? 40 : 56;
  const feature = card.style === 'feature' && !square;
  const identity = card.style === 'identity';
  const dark = feature || identity;
  const foreground = dark ? paper : ink;
  const layers: OverlayOptions[] = [];
  const photoWidth = square ? width : 530;
  const photoHeight = square ? 220 : height;
  const photoTop = square ? height - photoHeight : 0;
  const photoLeft = square ? 0 : width - photoWidth;

  if (feature) {
    layers.push({ input: await photograph(card.photos[0], 740, height), left: 460, top: 0 });
    layers.push({
      input: Buffer.from(
        `<svg width="1200" height="630"><defs><linearGradient id="shade"><stop offset=".36" stop-color="#0a0807"/><stop offset=".57" stop-color="#0a0807" stop-opacity=".2"/><stop offset=".78" stop-color="#0a0807" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#shade)"/></svg>`,
      ),
      left: 0,
      top: 0,
    });
  } else if (card.photos.length) {
    const sliceWidth = Math.floor(photoWidth / card.photos.length);
    for (const [index, photo] of card.photos.entries()) {
      const panelWidth =
        index === card.photos.length - 1 ? photoWidth - index * sliceWidth : sliceWidth - 4;
      layers.push({
        input: await photograph(photo, panelWidth, photoHeight, square),
        left: photoLeft + index * sliceWidth,
        top: photoTop,
      });
    }
  }

  // A restrained frame references the camera viewfinder without imitating UI controls.
  if (identity) {
    const mark = await readFile(path.join(root, 'public/brand/prophoto-icon.svg'), 'utf8');
    const symbol = await sharp(Buffer.from(mark)).resize(280, 280).png().toBuffer();
    const faded = await sharp(symbol)
      .ensureAlpha()
      .linear([1, 1, 1, 0.13], [0, 0, 0, 0])
      .png()
      .toBuffer();
    layers.push({ input: faded, left: square ? 350 : 850, top: square ? 350 : 300 });
  }

  layers.push({ input: await logo(card.brand, dark, square ? 320 : 360), left: inset, top: inset });
  const labelY = square ? 106 : 144;
  const label = await textImage(card.label, {
    size: 18,
    color: dark ? '#b7b0ab' : '#5c5552',
    font: 'body',
    maxWidth: square ? 550 : 560,
  });
  layers.push({ input: label.input, left: inset, top: labelY });
  layers.push({ input: rectangle(48, 5, red), left: inset, top: labelY + 36 });

  const titleY = square ? 166 : 213;
  const maxTitleWidth = square ? 550 : identity ? 940 : 568;
  let fontSize = square ? (card.lines.length === 3 ? 63 : 70) : card.lines.length === 3 ? 82 : 90;
  // Fit complete words; never truncate a course or legal title.
  const measured = await Promise.all(
    card.lines.map((line) =>
      textImage(line, { size: fontSize, color: foreground, font: 'heading' }),
    ),
  );
  fontSize = Math.min(
    fontSize,
    Math.floor((fontSize * maxTitleWidth) / Math.max(...measured.map((item) => item.width))),
  );
  const lineHeight = Math.ceil(fontSize * 1.02);
  for (const [index, line] of card.lines.entries()) {
    const row = await textImage(line, {
      size: fontSize,
      color: foreground,
      font: 'heading',
      maxWidth: maxTitleWidth,
    });
    layers.push({ input: row.input, left: inset, top: titleY + index * lineHeight });
  }

  const subtitleY = square ? 368 : Math.min(507, titleY + card.lines.length * lineHeight + 30);
  const subtitle = await textImage(card.subtitle, {
    size: square ? 20 : 25,
    color: foreground,
    font: 'body',
    maxWidth: square ? 550 : 560,
  });
  layers.push({ input: subtitle.input, left: inset, top: subtitleY });

  if (!square || identity) {
    const domain =
      card.brand === 'hub'
        ? 'prophotohub.com.ua'
        : card.brand === 'shop'
          ? 'prophotoshop.com.ua'
          : 'prophotoacademy.com.ua';
    const footer = await textImage(domain, {
      size: 18,
      color: dark ? '#b7b0ab' : '#5c5552',
      font: 'body',
    });
    layers.push({
      input: rectangle(square ? 550 : 556, 1, dark ? '#423a36' : '#d7d2ce'),
      left: inset,
      top: 554,
    });
    layers.push({ input: footer.input, left: inset, top: 576 });
  }

  const image = sharp({
    create: { width, height, channels: 3, background: dark ? '#0a0807' : paper },
  }).composite(layers);
  const raw = await image.png().toBuffer();
  for (const quality of [88, 83, 78, 72]) {
    const output = await sharp(raw)
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toBuffer();
    if (output.length <= 300_000) return output;
  }
  throw new Error(`Social image exceeds the 300 KB budget: ${card.path}`);
}
