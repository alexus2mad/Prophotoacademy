import { readFile, writeFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const project = fileURLToPath(new URL('../', import.meta.url));
const origin = 'http://127.0.0.1:3200';
const courseId = '7ea7d83f-372d-4e77-b8ef-302dbe4c659d';
const video = path.join(project, 'assets/lesson-light-study.mp4');
const ffmpeg = process.env.FFMPEG_PATH || 'D:/ffmpeg/bin/ffmpeg.exe';
if (
  !(await access(video).then(
    () => true,
    () => false,
  ))
) {
  const result = spawnSync(
    ffmpeg,
    [
      '-y',
      '-loglevel',
      'error',
      '-loop',
      '1',
      '-t',
      '4.5',
      '-i',
      path.join(project, 'assets/images/potato-opening.png'),
      '-loop',
      '1',
      '-t',
      '4',
      '-i',
      path.join(project, 'assets/images/potato-hero.png'),
      '-filter_complex',
      '[0:v]scale=1280:720,setsar=1,fps=30,format=yuv420p[a];[1:v]scale=1280:720,setsar=1,fps=30,format=yuv420p[b];[a][b]xfade=transition=fade:duration=0.5:offset=4,format=yuv420p[v]',
      '-map',
      '[v]',
      '-t',
      '8',
      '-c:v',
      'libx264',
      '-crf',
      '19',
      '-movflags',
      '+faststart',
      video,
    ],
    { encoding: 'utf8', windowsHide: true },
  );
  if (result.status !== 0) throw new Error(result.stderr);
}
let cookie = '';
async function request(route, value) {
  const response = await fetch(origin + route, {
    method: value ? 'POST' : 'GET',
    headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie },
    ...(value ? { body: JSON.stringify(value) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  if (route === '/api/auth/verify')
    cookie = response.headers
      .getSetCookie()
      .map((item) => item.split(';')[0])
      .join('; ');
  return data.result ?? data;
}
await request('/api/auth/send', { email: 'manager@example.test' });
await request('/api/auth/verify', { email: 'manager@example.test', code: '123456' });
const draft = await request('/api/admin/courses/' + courseId);
const lesson = draft.modules.flatMap((m) => m.lessons).find((l) => l.title === 'Картопля — муза');
if (!lesson) throw new Error('Save the new lesson title in the real manager UI first');
for (const asset of [
  {
    kind: 'video',
    title: 'Як світло змінює предмет',
    file: video,
    mime: 'video/mp4',
    expectedSeconds: 8,
  },
  {
    kind: 'image',
    title: 'Світло, фактура, характер',
    file: path.join(project, 'assets/images/potato-hero.png'),
    mime: 'image/png',
    expectedSeconds: 5,
    alt: 'Навчальна рекламна постановка: звичайна картоплина на чорному шовку, освітлена збоку',
  },
]) {
  if (lesson.blocks.some((b) => b.title === asset.title)) continue;
  const upload = await request('/api/admin/uploads', {
    courseId,
    kind: asset.kind,
    title: asset.title,
    mime: asset.mime,
  });
  if (new URL(upload.url).origin !== 'http://127.0.0.1:3202') throw new Error('Local upload only');
  const response = await fetch(upload.url, {
    method: upload.method,
    headers: upload.headers,
    body: await readFile(asset.file),
  });
  if (!response.ok) throw new Error('Upload failed');
  const media = await request('/api/admin/upload-complete', { id: upload.id });
  if (media.status !== 'ready') throw new Error('Media not ready');
  const block = {
    id: randomUUID(),
    kind: asset.kind,
    title: asset.title,
    required: true,
    revision: 1,
    mediaId: upload.id,
    expectedSeconds: asset.expectedSeconds,
    alt: asset.alt,
  };
  if (asset.kind === 'video') lesson.blocks.unshift(block);
  else lesson.blocks.push(block);
}
await request('/api/admin/courses/' + courseId, { action: 'save', value: draft });
await writeFile(
  path.join(project, 'capture/lesson-fixture.json'),
  JSON.stringify(
    {
      courseId,
      lessonId: lesson.id,
      source: 'Actual local sandbox, supplied through authorized media upload APIs',
      payment: 'Disabled',
      student: 'guest@example.test',
      note: 'Teaching video is an eight-second before/after lighting study made from the generated campaign images. Not a real teacher recording.',
    },
    null,
    2,
  ) + '\n',
);
console.log('Local lesson media ready; publish through the manager UI');
