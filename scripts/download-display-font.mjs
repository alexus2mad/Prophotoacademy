import { writeFile } from 'node:fs/promises';
const css = await (
  await fetch('https://fonts.googleapis.com/css2?family=Lora:ital,wght@1,400&display=swap', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
).text();
const url = css.match(/url\((https:[^)]+)\)/)?.[1];
if (!url) throw new Error('Missing font URL');
const response = await fetch(url);
if (!response.ok) throw new Error('Font download failed');
await writeFile('src/app/fonts/lora-italic.woff2', Buffer.from(await response.arrayBuffer()));
await writeFile(
  'content/source/lora-license.txt',
  await (
    await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/lora/OFL.txt')
  ).text(),
);
console.log('Downloaded Lora italic and its OFL license');
