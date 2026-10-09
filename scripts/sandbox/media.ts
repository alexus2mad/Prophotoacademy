import { randomUUID } from 'node:crypto';
import { databasePool } from '@/lib/database/client';
import { HttpError } from '@/lib/http';
import { rpc } from './rpc';
import type { UploadInput, LearningMedia } from '@/lib/learning/types';
import type { SandboxUpload, SandboxMediaAccess } from './types';
export async function createMediaUpload(input: UploadInput, actorId: string) {
  if (
    !(await databasePool().query('SELECT id FROM academy.courses WHERE id=$1', [input.courseId]))
      .rowCount
  )
    throw new HttpError(404, 'Курс не знайдено');
  const expected =
    input.kind === 'pdf'
      ? ['application/pdf']
      : input.kind === 'video'
        ? ['video/mp4']
        : ['image/jpeg', 'image/png', 'image/webp'];
  if (!expected.includes(input.mime))
    throw new HttpError(400, 'Оберіть PDF, зображення або MP4 відповідно до типу блока');
  const id = randomUUID(),
    upload = await rpc<SandboxUpload>('media.upload', { id, mime: input.mime });
  await databasePool().query(
    'INSERT INTO academy.media(id,course_id,kind,title,object_path,mime,created_by) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [id, input.courseId, input.kind, input.title, id, input.mime, actorId],
  );
  return { id, url: upload.url, method: 'PUT', headers: { 'Content-Type': input.mime } };
}
export async function finishMediaUpload(id: string, pageSeconds?: number[]) {
  const media = (
    await databasePool().query<LearningMedia>('SELECT * FROM academy.media WHERE id=$1', [id])
  ).rows[0];
  if (!media) throw new HttpError(404, 'Матеріал не знайдено');
  const info = await rpc<SandboxUpload>('media.info', { id });
  if (!info.size || info.size > 52428800) throw new HttpError(400, 'Перевірте файл: до 50 МБ');
  if (media.kind === 'pdf' && !pageSeconds?.length)
    throw new HttpError(400, 'Не вдалося прочитати PDF');
  if (media.kind === 'video' && !info.duration)
    throw new HttpError(400, 'MP4 потребує локального ffprobe для визначення тривалості');
  await databasePool().query(
    "UPDATE academy.media SET status='ready',duration=$1,page_count=$2,metadata=$3 WHERE id=$4",
    [
      info.duration || null,
      pageSeconds?.length || null,
      JSON.stringify({ pageSeconds: pageSeconds || [] }),
      id,
    ],
  );
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
  if (!media) throw new HttpError(404, 'Матеріал недоступний');
  return rpc<SandboxMediaAccess>('media.read', { id });
}
