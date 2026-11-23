import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { HttpError } from '../http';
import { editorMode, localDirectory, marketingClient, unavailable } from './storage/config';
import { uploadName } from './image-library/uploads';

const imageLimit = 10 * 1024 * 1024;
const multipartLimit = imageLimit + 64 * 1024;

async function multipartImage(request: Request) {
  const type = request.headers.get('content-type') || '';
  if (!type.startsWith('multipart/form-data;'))
    throw new HttpError(415, 'Оберіть файл зображення.');
  if (Number(request.headers.get('content-length')) > multipartLimit)
    throw new HttpError(413, 'Максимальний розмір зображення — 10 МБ.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Оберіть файл зображення.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > multipartLimit) {
      await reader.cancel();
      throw new HttpError(413, 'Максимальний розмір зображення — 10 МБ.');
    }
    chunks.push(value);
  }
  let form: FormData;
  try {
    form = await new Response(Buffer.concat(chunks), {
      headers: { 'Content-Type': type },
    }).formData();
  } catch {
    throw new HttpError(400, 'Не вдалося прочитати файл.');
  }
  const file = form.get('file');
  if (!file || typeof file === 'string' || !file.size)
    throw new HttpError(400, 'Оберіть файл зображення.');
  if (file.size > imageLimit) throw new HttpError(413, 'Максимальний розмір зображення — 10 МБ.');
  return { input: Buffer.from(await file.arrayBuffer()), name: uploadName(file.name) };
}

export async function uploadPageImage(request: Request) {
  const mode = editorMode();
  if (mode === 'readonly') throw unavailable();
  const { input, name } = await multipartImage(request);
  let webp: Buffer;
  try {
    const image = sharp(input, { limitInputPixels: 40_000_000, failOn: 'error' });
    const info = await image.metadata();
    if (!['jpeg', 'png', 'webp', 'heif'].includes(info.format) || (info.pages || 1) > 1)
      throw new Error('unsupported image');
    webp = await image
      .rotate()
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();
  } catch {
    throw new HttpError(422, 'Потрібне зображення JPEG, PNG, WebP або AVIF до 40 мегапікселів.');
  }
  const id = createHash('sha256').update(webp).digest('hex');
  if (mode === 'local') {
    const dir = path.join(localDirectory(), 'images');
    await mkdir(dir, { recursive: true });
    const temporary = path.join(dir, randomUUID() + '.tmp');
    try {
      await writeFile(temporary, webp, { flag: 'wx' });
      await rename(temporary, path.join(dir, id + '.webp'));
      await writeFile(path.join(dir, id + '.name'), name, { flag: 'wx' }).catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code !== 'EEXIST') throw error;
        },
      );
    } finally {
      await rm(temporary, { force: true });
    }
    return '/api/site-content/images/' + id;
  }
  const asset = await marketingClient(true).assets.upload('image', webp, {
    filename: name + '.webp',
    contentType: 'image/webp',
  });
  return asset.url;
}

export async function readLocalImage(id: string) {
  if (editorMode() !== 'local' || !/^[a-f0-9]{64}$/.test(id))
    throw new HttpError(404, 'Файл не знайдено.');
  try {
    return await readFile(path.join(localDirectory(), 'images', id + '.webp'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
      throw new HttpError(404, 'Файл не знайдено.');
    throw error;
  }
}
