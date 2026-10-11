import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const project = fileURLToPath(new URL('../', import.meta.url));
const campaign = process.argv[2] === 'campaign';
const output = path.join(
  project,
  campaign ? 'assets/audio/campaign.alignment.json' : 'assets/audio/narration.alignment.json',
);
try {
  await access(output);
  console.log('Existing alignment retained');
  process.exit(0);
} catch {}
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error('ELEVENLABS_API_KEY is required');
const narration = JSON.parse(
  await readFile(path.join(project, campaign ? 'campaign-voice.json' : 'narration.json'), 'utf8'),
);
const audio = await readFile(
  path.join(project, campaign ? 'assets/audio/campaign-take-3.mp3' : 'assets/audio/narration.mp3'),
);
const form = new FormData();
form.append('file', new Blob([audio], { type: 'audio/mpeg' }), 'narration.mp3');
form.append('text', narration.text);
const response = await fetch('https://api.elevenlabs.io/v1/forced-alignment', {
  method: 'POST',
  headers: { 'xi-api-key': apiKey },
  body: form,
  signal: AbortSignal.timeout(120000),
});
if (!response.ok) throw new Error(`Alignment failed: ${response.status} ${await response.text()}`);
const alignment = await response.json();
if (!Array.isArray(alignment.words) || !alignment.words.length)
  throw new Error('Provider returned no word timings');
await writeFile(output, JSON.stringify(alignment, null, 2) + '\n');
console.log(JSON.stringify(alignment.words));
