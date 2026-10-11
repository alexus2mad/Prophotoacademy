import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const directory = process.argv[2] || 'capture';
const files = (await readdir(directory)).filter(
  (name) => /\.(jpg|png)$/.test(name) && !name.includes('contact-sheet'),
);
const width = 480,
  height = 300;
const tiles = await Promise.all(
  files.map(async (name, index) => ({
    input: await sharp(path.join(directory, name))
      .resize(width, height - 30, { fit: 'contain', background: '#101211' })
      .extend({ bottom: 30, top: 0, left: 0, right: 0, background: '#101211' })
      .composite([
        {
          input: Buffer.from(
            `<svg width="480" height="300"><text x="10" y="291" fill="white" font-size="15">${name}</text></svg>`,
          ),
        },
      ])
      .jpeg()
      .toBuffer(),
    left: (index % 3) * width,
    top: Math.floor(index / 3) * height,
  })),
);
await sharp({
  create: {
    width: width * 3,
    height: Math.ceil(files.length / 3) * height,
    channels: 3,
    background: '#101211',
  },
})
  .composite(tiles)
  .jpeg({ quality: 90 })
  .toFile(path.join(directory, 'contact-sheet.jpg'));
console.log(`${files.length} source frames indexed`);
