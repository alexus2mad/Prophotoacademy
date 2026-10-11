import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const ffmpeg = process.env.FFMPEG_PATH || 'D:/ffmpeg/bin/ffmpeg.exe';
const times = [1.2, 5.6, 8.3, 10.4, 12.8, 14.7, 17.9, 20.5, 22.9, 26.3, 28.8, 30.5, 34.5];
await mkdir('renders/qa', { recursive: true });
for (const [index, time] of times.entries()) {
  const result = spawnSync(
    ffmpeg,
    [
      '-y',
      '-loglevel',
      'error',
      '-ss',
      String(time),
      '-i',
      'renders/prophoto-workflow-yoi.mp4',
      '-frames:v',
      '1',
      '-q:v',
      '2',
      `renders/qa/${String(index).padStart(2, '0')}-${time}s.jpg`,
    ],
    { encoding: 'utf8', windowsHide: true },
  );
  if (result.status !== 0) throw new Error(result.stderr);
}
await writeFile('renders/qa/frame-times.json', JSON.stringify(times));
console.log('Extracted 13 actual MP4 frames for review');
