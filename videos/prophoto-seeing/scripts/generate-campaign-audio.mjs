import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const project = fileURLToPath(new URL('../', import.meta.url));
const audioDir = path.join(project, 'assets/audio');
await mkdir(audioDir, { recursive: true });
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error('ELEVENLABS_API_KEY is required');
const exists = async (file) =>
  access(file).then(
    () => true,
    () => false,
  );
async function post(endpoint, body) {
  const response = await fetch('https://api.elevenlabs.io/v1/' + endpoint, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(240000),
  });
  if (!response.ok) throw new Error(`${endpoint}: ${response.status} ${await response.text()}`);
  return response;
}
const job = process.argv[2];
if (job === 'voice') {
  if (await exists(path.join(project, 'campaign-voice.json'))) process.exit(0);
  const text =
    'Підборіддя трохи вище. Навіть для такого кадру потрібен план. Менеджер готує урок, додає матеріали й публікує курс. Відкриває доступ. Студент дивиться, пробує, повертається до збереженого уроку. А менеджер бачить прогрес. Оце вже мистецтво. ПроФото. Щоб аж йой!';
  const description =
    'Native Ukrainian woman around thirty, charismatic creative director. Contemporary Ukrainian pronunciation with no Russian accent. Warm textured mid-low register, lively precise consonants, natural breaths, unmistakable personality. Deliver the first short direction with completely serious dry comic understatement, as if directing a supermodel. Conversational energetic momentum through the course workflow. A tiny smile of delighted satisfaction on the art reveal. Finish the brand slogan with a spontaneous playful burst of joy on the final Ukrainian word yoy. Never monotonous, sleepy, formal, syrupy, shouting or sales announcer. Close clean studio sound, no music.';
  const params = {
    model_id: 'eleven_ttv_v3',
    voice_description: description,
    text,
    seed: 31011,
    loudness: 0.4,
  };
  const data = await (
    await post('text-to-voice/design?output_format=mp3_44100_192', params)
  ).json();
  const previews = [];
  for (const [index, preview] of data.previews.entries()) {
    const file = `assets/audio/campaign-take-${index + 1}.mp3`;
    await writeFile(path.join(project, file), Buffer.from(preview.audio_base_64, 'base64'));
    previews.push({
      file,
      duration: preview.duration_secs,
      generatedVoiceId: preview.generated_voice_id,
    });
  }
  await writeFile(
    path.join(project, 'campaign-voice.json'),
    JSON.stringify(
      {
        text,
        description,
        seed: 31011,
        model: params.model_id,
        previews,
        selectedTake: 3,
        note: 'Fresh performance authorized by user; selected ordinal follows prior Voice 3 preference. Not the identical saved voice.',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify(previews.map(({ file, duration }) => ({ file, duration }))));
} else if (job === 'score') {
  const file = path.join(audioDir, 'campaign-score.mp3');
  if (await exists(file)) process.exit(0);
  const params = {
    model_id: 'music_v2',
    music_length_ms: 32000,
    force_instrumental: true,
    prompt:
      'A precise 32-second instrumental score for an irreverent premium fashion and photography commercial. 120 BPM, confident dry syncopated bass, tactile pizzicato strings, crisp minimal breakbeat drums, small orchestral stabs, clever poised swagger. First two seconds a sudden elegant entrance, then a nimble understated groove with lots of space for a female Ukrainian voice, not busy or loud. Sustain momentum for 22 seconds, then an extravagant short string flourish at seconds 23-26 for a ridiculous luxury portrait reveal. Final six seconds simplify to a confident tonic chord and crisp bass punctuation; a complete satisfying resolved ending with natural decay fully finished by second 32. Instrumental only, no singing or speech. No corporate inspirational piano, no ambient wash, no EDM drop, no trailer braams, no generic swooshes.',
  };
  const response = await post('music?output_format=mp3_48000_192', params);
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
  await writeFile(path.join(project, 'score-prompt.json'), JSON.stringify(params, null, 2) + '\n');
  console.log('Generated campaign-score.mp3');
} else if (job === 'shutter') {
  const file = path.join(audioDir, 'double-shutter.mp3');
  if (await exists(file)) process.exit(0);
  const params = {
    text: 'Exactly two satisfyingly crisp close-miked professional camera mechanical shutter clicks, ka-chik ka-chik, separated by a quarter second. Tiny metallic spring detail and low mechanical body, realistic dry recording. No music, no voices, no ambience, no whoosh or echo. A distinctive compact photography brand sound mark.',
    model_id: 'eleven_text_to_sound_v2',
    duration_seconds: 1.2,
    prompt_influence: 0.7,
  };
  const response = await post('sound-generation?output_format=mp3_44100_192', params);
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
  await writeFile(
    path.join(project, 'shutter-prompt.json'),
    JSON.stringify(params, null, 2) + '\n',
  );
  console.log('Generated double-shutter.mp3');
} else throw new Error('Choose voice, score, or shutter');
