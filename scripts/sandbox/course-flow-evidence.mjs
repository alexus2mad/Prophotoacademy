import { readFile, readdir, writeFile } from 'node:fs/promises';

const directory = new URL('../../.data/learning-sandbox/multi-lesson/', import.meta.url);
const result = JSON.parse(await readFile(new URL('verification.json', directory), 'utf8'));
const screenshots = (await readdir(new URL('screenshots/', directory)))
  .filter((name) => name.endsWith('.jpg'))
  .sort();
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
const html = `<!doctype html><html lang="uk"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ProPhoto — перевірка навчального сценарію</title>
<style>body{margin:0;background:#101211;color:#f2efe7;font:16px/1.6 system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:48px 24px}h1{font-size:clamp(28px,4vw,44px);line-height:1.2}h2{margin-top:40px}p{max-width:80ch;color:#b9c0b5}a{color:#d5e4b9}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:24px}figure{margin:0;border:1px solid #333a33;border-radius:16px;overflow:hidden;background:#191c1a}img{display:block;width:100%;height:300px;object-fit:contain;background:#080a09}figcaption{padding:16px;overflow-wrap:anywhere}li{margin-bottom:8px}</style>
<main><h1>Контент для бренду — тестовий курс</h1><p>Локальний стенд · 4 уроки у 2 модулях · жодних оплат або реальних листів</p>
<p>Перевірено створення чернетки, зміну порядку уроків, публікацію, пакет доступу, розклад Zoom, надання/скасування/відновлення доступу, читання матеріалів, сторінки PDF, підтвердження опрацювання та відвідування. Три уроки завершені студентським підтвердженням, Zoom — через журнал адміністратора. Обидві панелі показують 100%.</p>
<p>Зображення та PDF підготовлені через авторизований локальний API. Решта основного сценарію пройдена в браузері. Це не перевірка реальних Supabase, Sanity, Mux, Zoom, email або WayForPay. Посилання Zoom є синтетичними, зустрічі не проводилися.</p>
<h2>Виправлення після перевірки</h2><ul><li>Відступи між модулями редактора, статусом збереження, заголовками та картками</li><li>Мобільне перенесення кнопок, поля форм і 44px зони керування порядком</li><li>Ізоляція меню акаунта від стилів FAQ, доступна назва меню та маркери навчальних списків</li><li>Завершений курс не показує «Наступний урок»</li><li>Повторне збереження нової Zoom-зустрічі оновлює її замість створення дубля</li></ul>
<h2>API-перевірки</h2><p>${escape(result.checkedAt)}</p><ul>${result.checks.map((name) => `<li>${escape(name)}</li>`).join('')}</ul>
<h2>Знімки екрана</h2><p>Натисніть зображення, щоб відкрити оригінал. Ранні знімки фіксують стан до виправлень.</p><div class="gallery">${screenshots.map((name) => `<figure><a href="screenshots/${encodeURIComponent(name)}"><img loading="lazy" src="screenshots/${encodeURIComponent(name)}" alt="${escape(name.replace(/\.jpg$/, '').replaceAll('-', ' '))}"></a><figcaption>${escape(name)}</figcaption></figure>`).join('')}</div></main></html>`;
await writeFile(new URL('walkthrough.html', directory), html);
console.log(
  `${screenshots.length} screenshots indexed in .data/learning-sandbox/multi-lesson/walkthrough.html`,
);
