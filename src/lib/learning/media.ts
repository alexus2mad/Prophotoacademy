import Mux from '@mux/ts';
import { randomUUID } from 'node:crypto';
import { storageClient } from '../auth/server';
import { databasePool } from '../database/client';
import { HttpError } from '../http';
import type { LearningMedia, UploadInput } from './types';
async function privateStorage() {
  const client = storageClient();
  const { data, error } = await client.storage.getBucket('learning');
  if (error || !data || data.public)
    throw new HttpError(503, 'Потрібне приватне сховище навчальних матеріалів');
  return client.storage.from('learning');
}
export function muxClient() {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET)
    throw new HttpError(503, 'Відеосховище ще не підключено');
  return new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET });
}
export async function createMediaUpload(input: UploadInput, actorId: string) {
  const id = randomUUID();
  if (
    !(await databasePool().query('SELECT id FROM academy.courses WHERE id=$1', [input.courseId]))
      .rowCount
  )
    throw new HttpError(404, 'Курс не знайдено');
  if (input.kind === 'video') {
    const upload = await muxClient().video.uploads.create({
      cors_origin: new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin,
      new_asset_settings: {
        playback_policies: ['signed'],
        video_quality: 'basic',
        passthrough: id,
      },
    });
    await databasePool().query(
      'INSERT INTO academy.media(id,course_id,kind,title,provider_id,mime,created_by) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [id, input.courseId, input.kind, input.title, upload.id, input.mime, actorId],
    );
    return { id, url: upload.url, method: 'PUT', headers: { 'Content-Type': input.mime } };
  }
  if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(input.mime))
    throw new HttpError(400, 'Підтримуються PDF, JPEG, PNG і WebP');
  if ((input.kind === 'pdf') !== (input.mime === 'application/pdf'))
    throw new HttpError(400, 'Тип файла не відповідає матеріалу');
  const extension = input.mime === 'application/pdf' ? 'pdf' : input.mime.split('/')[1];
  const objectPath = input.courseId + '/' + id + '.' + extension;
  const { data, error } = await (
    await privateStorage()
  ).createSignedUploadUrl(objectPath, { upsert: false });
  if (error || !data) throw new HttpError(502, 'Не вдалося підготувати завантаження');
  await databasePool().query(
    'INSERT INTO academy.media(id,course_id,kind,title,object_path,mime,created_by) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [id, input.courseId, input.kind, input.title, objectPath, input.mime, actorId],
  );
  return { id, url: data.signedUrl, method: 'PUT', headers: { 'Content-Type': input.mime } };
}
export async function finishMediaUpload(id: string, pageSeconds?: number[]) {
  const media = (
    await databasePool().query<LearningMedia>('SELECT * FROM academy.media WHERE id=$1', [id])
  ).rows[0];
  if (!media) throw new HttpError(404, 'Матеріал не знайдено');
  if (media.kind === 'video') {
    const upload = await muxClient().video.uploads.retrieve(media.provider_id!);
    if (
      upload.status === 'errored' ||
      upload.status === 'cancelled' ||
      upload.status === 'timed_out'
    ) {
      await databasePool().query("UPDATE academy.media SET status='failed' WHERE id=$1", [id]);
      throw new HttpError(400, 'Не вдалося обробити відео');
    }
    if (upload.asset_id) {
      const asset = await muxClient().video.assets.retrieve(upload.asset_id);
      const playback = asset.playback_ids?.find((p) => p.policy === 'signed');
      await databasePool().query(
        'UPDATE academy.media SET status=$1,playback_id=$2,duration=$3 WHERE id=$4',
        [
          asset.status === 'ready' && playback
            ? 'ready'
            : asset.status === 'errored'
              ? 'failed'
              : 'processing',
          playback?.id || null,
          asset.duration || null,
          id,
        ],
      );
    }
  } else {
    const { data, error } = await (await privateStorage()).info(media.object_path!);
    if (error || !data || Number(data.size) > 52_428_800)
      throw new HttpError(400, 'Перевірте файл: максимальний розмір 50 МБ');
    if (media.kind === 'pdf' && !pageSeconds?.length)
      throw new HttpError(400, 'Не вдалося прочитати сторінки PDF');
    await databasePool().query(
      "UPDATE academy.media SET status='ready',page_count=$1,metadata=$2 WHERE id=$3",
      [pageSeconds?.length || null, JSON.stringify({ pageSeconds: pageSeconds || [] }), id],
    );
  }
  return (
    await databasePool().query<LearningMedia>('SELECT * FROM academy.media WHERE id=$1', [id])
  ).rows[0];
}
export async function mediaAccess(id: string) {
  const media = (
    await databasePool().query<LearningMedia>(
      "SELECT * FROM academy.media WHERE id=$1 AND status='ready'",
      [id],
    )
  ).rows[0];
  if (!media) throw new HttpError(404, 'Матеріал поки недоступний');
  if (media.kind === 'video') {
    const mux = muxClient(),
      expiration = Math.ceil(Number(media.duration || 3600) + 300) + 's';
    return {
      playbackId: media.playback_id!,
      token: await mux.jwt.signPlaybackId(media.playback_id!, { expiration, type: 'video' }),
      thumbnailToken: await mux.jwt.signPlaybackId(media.playback_id!, {
        expiration,
        type: 'thumbnail',
      }),
    };
  }
  const { data, error } = await (await privateStorage()).createSignedUrl(media.object_path!, 300);
  if (error || !data) throw new HttpError(502, 'Не вдалося відкрити матеріал');
  return { url: data.signedUrl };
}
