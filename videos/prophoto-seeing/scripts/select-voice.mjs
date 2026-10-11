import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const project = fileURLToPath(new URL('../', import.meta.url));
const design = JSON.parse(
  (await readFile(path.join(project, 'voice-design.json'), 'utf8')).replace(/^\uFEFF/, ''),
);
const preview = design.previews[2];
await copyFile(path.join(project, preview.file), path.join(project, 'assets/audio/narration.mp3'));
await writeFile(
  path.join(project, 'narration.json'),
  JSON.stringify(
    {
      text: design.text,
      model: design.model,
      chosenPreview: 3,
      selectedBy: 'user',
      source: preview.file,
      durationSeconds: preview.duration,
      note: 'Use the exact approved generated audition. No custom voice profile was created; the provider account has reached its saved-voice limit.',
    },
    null,
    2,
  ) + '\n',
);
console.log('Selected approved Voice 3, preserving the original generated performance');
