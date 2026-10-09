import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const photos = [
  ['hero', '18umR5CgY2x4r4JOjS2zl3b4iPP1EopW7'],
  ['visual', '1pI6wLpDYGGYyC82Eczf2tzqRUSCQLL5A'],
  ['commercial', '1l573rQV5dr31hbCm-UQB4NNm7fh1Mc-C'],
  ['instagram', '17qUog7eTswv11nSKrX1HZHKdM8fGSWRJ'],
  ['founder', '1pf8rlNNqpAvwRBNQSDSk7sTQVIaHL3mP'],
  ['olena', '1Mu-7CxmgVE7jVKeJqaqjQDlCGsofa_yF'],
  ['oleksandra', '15KNEh9p4GARXQtqqQMgBqmZVPwBzt8wv'],
  ['practice', '1pT80-2naNt95QyulgimlyiF52Ntw2YTC'],
  ['workshop', '1baVjO0R75dvU7BzCQ_3JA51hJFL1PlQI'],
  ['student-cherries', '167HOFU8SjyffN4YgINe96ys9NFUqGLyJ'],
  ['student-portrait', '1hCMb6MqPLbNt1LJMHkiDaMxdvtW58tVy'],
  ['student-pasta', '1OdsMfsbbrCCIsiiNURjT38IFJnikZchRx'.replace('CIs', 'Is')],
  ['student-shoes', '1irECMDHBGAzGtwnFjP6PfsuF4ykTOPmT'],
  ['student-splash', '1Q1h-NvBbxpScmcWu7K6J8WyZCslp1DQr'],
  ['student-perfume', '1tATa7XXPObBERlFu6oRqHFSoqf8h2JmH'],
];
await mkdir('public/images', { recursive: true });
for (let i = 0; i < photos.length; i += 3) {
  await Promise.all(
    photos.slice(i, i + 3).map(async ([name, id]) => {
      const target = path.join('public/images', `${name}-original.jpg`);
      try {
        if ((await stat(target)).size > 10000) return;
      } catch {}
      const response = await fetch(`https://drive.google.com/uc?export=download&id=${id}`);
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/'))
        throw new Error(
          `Image ${name}: ${response.status} ${response.headers.get('content-type')}`,
        );
      await writeFile(target, Buffer.from(await response.arrayBuffer()));
      console.log(`Downloaded ${name}`);
    }),
  );
}
await mkdir('src/app/fonts', { recursive: true });
const css = await (
  await fetch('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&display=swap', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
).text();
const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((x) => x[1]))];
for (const [index, url] of urls.entries()) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Font download failed');
  await writeFile(
    `src/app/fonts/manrope-${index}.woff2`,
    Buffer.from(await response.arrayBuffer()),
  );
}
await writeFile(
  'content/source/font-license.txt',
  await (
    await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt')
  ).text(),
);
console.log(`Font files: ${urls.length}`);
