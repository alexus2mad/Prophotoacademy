import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const ffmpeg = process.env.FFMPEG_PATH || 'D:/ffmpeg/bin/ffmpeg.exe';
await mkdir('compositions/frames', { recursive: true });
await mkdir('renders', { recursive: true });
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const json = (value) => escape(JSON.stringify(value));
const base = `
@font-face{font-family:KyivType;src:url('assets/fonts/kyivtype-regular.woff2') format('woff2');font-weight:400}
@font-face{font-family:Manrope;src:url('assets/fonts/manrope-0.woff2') format('woff2');font-weight:400}
*{box-sizing:border-box;margin:0;padding:0}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#101211;color:#F2EFE7;font-family:Manrope,sans-serif}
.role{position:absolute;left:120px;top:83px;font-size:32px;line-height:1.2;color:#D5E4B9}
.window{position:absolute;left:120px;top:170px;width:1680px;height:760px;overflow:hidden;border:1px solid #454B40;border-radius:20px;background:#101211}
.world{position:absolute;inset:0;transform-origin:0 0;will-change:transform}
.source{position:absolute;display:block;max-width:none}
.layer{position:absolute;inset:0;width:100%;height:100%}
.full-photo{width:1920px;height:1080px;object-fit:cover;display:block}
.display{font-family:KyivType,serif;font-weight:400;letter-spacing:-3px;line-height:1.04}
.cursor{position:absolute;width:32px;height:44px;z-index:5;filter:drop-shadow(0 2px 3px #000000);pointer-events:none}
.ring{position:absolute;width:72px;height:72px;border:3px solid #D5E4B9;border-radius:50%;z-index:4;opacity:0;pointer-events:none}
`;
const cursor = (id, x, y) =>
  `<svg id="${id}" class="cursor" style="left:${x}px;top:${y}px" viewBox="0 0 32 44" aria-hidden="true" data-layout-ignore><path d="M2 2V36L11 28L18 42L24 39L17 25H30Z" fill="#F2EFE7" stroke="#101211" stroke-width="2"/></svg><div id="${id}-ring" class="ring" style="left:${x - 30}px;top:${y - 30}px" data-layout-ignore></div>`;
// Camera geometry adapted from the installed ui-focus-zoom component.
// The screenshot stays intact; the single world wrapper owns the crop transform.
function shot(id, file, crop, start, duration, options = {}) {
  const { x = 120, y = 170, w = 1680, h = 760 } = options;
  const scale = w / crop.w;
  return `<div id="${id}-shot" class="clip" data-start="${start}" data-duration="${duration}" data-track-index="2"><div class="window" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div id="${id}" class="world" data-layout-allow-overflow><img class="source" data-layout-allow-overflow src="capture/${file}" alt="Actual local ProPhoto workflow capture" style="left:${-crop.x * scale}px;top:${-crop.y * scale}px;width:${1266 * scale}px" /></div></div></div>`;
}
async function scene(id, duration, content, script, css = '') {
  let index = 0;
  content = content.replaceAll(
    '<div class="clip',
    () => `<div id="scene-${id}-clip-${++index}" class="clip`,
  );
  const html = `<template><style>${base}${css}</style><div id="root" data-composition-id="${id}" data-duration="${duration}" data-width="1920" data-height="1080">${content}</div><script src="assets/vendor/gsap.min.js"></script><script>(()=>{const tl=gsap.timeline({paused:true});${script}\nwindow.__timelines['${id}']=tl;})();</script></template>`;
  await writeFile(`compositions/frames/${id}.html`, html);
}

await scene(
  '01-model',
  3.5,
  `<div id="potato-first" data-layout-allow-overflow><img class="full-photo" src="assets/images/potato-opening.png" alt="A humble potato on a studio plinth"/></div>`,
  `tl.fromTo('#potato-first',{scale:1},{scale:1.035,duration:2.5,ease:'power2.inOut'},0.5);`,
);

await scene(
  '02-lesson',
  8,
  `<p class="role">Менеджер · Academy</p>
  ${shot('lesson-outline', 'manager-published.jpg', { x: 225, y: 150, w: 1010 }, 0, 3.9)}
  ${shot('lesson-materials', 'manager-materials.jpg', { x: 225, y: 247, w: 1010 }, 3.9, 1.9)}
  ${shot('lesson-publish', 'manager-publish-confirm.jpg', { x: 0, y: 0, w: 640 }, 5.8, 2.2)}
  <div class="clip" data-start="6" data-duration="2" data-track-index="3">${cursor('publish-cursor', 553, 642)}</div>`,
  `tl.fromTo('#lesson-outline',{scale:1.025,y:14},{scale:1,y:0,duration:0.8,ease:'power3.out'},0);
   tl.to('#lesson-outline',{scale:1.02,x:8,y:0,duration:0.85,ease:'power2.inOut'},1.35);
   tl.fromTo('#lesson-materials',{x:26},{x:0,duration:0.7,ease:'power3.out'},3.9);
   tl.fromTo('#lesson-publish',{scale:1.04},{scale:1,duration:0.65,ease:'power3.out'},5.8);
   tl.fromTo('#publish-cursor',{x:95,y:75,opacity:0},{x:0,y:0,opacity:1,duration:0.55,ease:'power2.out'},6);
   tl.fromTo('#publish-cursor-ring',{scale:0.4,opacity:0.9},{scale:1.25,opacity:0,duration:0.55,ease:'power2.out'},6.65);`,
);

await scene(
  '03-access',
  4,
  `<p class="role">Менеджер · ps-booking</p><h1 class="display access-title">Доступ<br>за email</h1><p class="access-note">Курс і потрібні уроки для конкретного студента</p>
  ${shot('access-top', 'manager-access-top.jpg', { x: 410, y: 170, w: 435 }, 0, 2.25, { x: 965, y: 152, w: 690, h: 788 })}
  ${shot('access-bottom', 'manager-access-updated-form.jpg', { x: 410, y: 185, w: 435 }, 2.25, 1.75, { x: 965, y: 152, w: 690, h: 788 })}
  <div class="clip" data-start="2.4" data-duration="1.6" data-track-index="3">${cursor('access-cursor', 1335, 847)}</div>`,
  `tl.fromTo('.access-title',{y:25,opacity:0},{y:0,opacity:1,duration:0.65,ease:'power3.out'},0);
   tl.fromTo('#access-top',{y:18},{y:0,duration:0.8,ease:'power3.out'},0);
   tl.fromTo('#access-bottom',{y:28},{y:0,duration:0.55,ease:'power3.out'},2.25);
   tl.fromTo('#access-cursor',{x:70,y:55,opacity:0},{x:0,y:0,opacity:1,duration:0.4,ease:'power2.out'},2.4);
   tl.fromTo('#access-cursor-ring',{scale:0.4,opacity:0.9},{scale:1.25,opacity:0,duration:0.5,ease:'power2.out'},3.05);`,
  `.access-title{position:absolute;left:180px;top:310px;font-size:112px}.access-note{position:absolute;left:184px;top:598px;width:610px;font-size:32px;line-height:1.55;color:#B9BDB4}.window{border-radius:16px}`,
);

await scene(
  '04-student',
  9,
  `<p class="role">Студент · Academy</p>
   ${shot('learner-dashboard', 'student-dashboard.jpg', { x: 28, y: 150, w: 1206 }, 0, 1.5)}
   ${shot('learner-video', 'student-video-start.jpg', { x: 0, y: 60, w: 1252 }, 1.5, 2.5)}
   ${shot('learner-photo', 'student-video-finished.jpg', { x: 0, y: 60, w: 1252 }, 4, 1.75)}
   ${shot('learner-resume', 'student-resume-full.jpg', { x: 27, y: 327, w: 970 }, 5.75, 3.25)}`,
  `tl.fromTo('#learner-dashboard',{scale:1.015,y:16},{scale:1,y:0,duration:0.6,ease:'power3.out'},0);
   tl.fromTo('#learner-video',{scale:1},{scale:1.025,x:0,y:0,duration:1.6,ease:'power2.inOut'},1.5);
   tl.set('#learner-photo',{scale:1.025},4);
   tl.fromTo('#learner-resume',{scale:1},{scale:1.06,x:12,y:-18,duration:0.9,ease:'power2.inOut'},6.2);`,
);

await scene(
  '05-progress',
  3,
  `<p class="role">Менеджер · ps-booking</p>${shot('progress-record', 'manager-progress-full.jpg', { x: 25, y: 440, w: 1200 }, 0, 3)}`,
  `tl.fromTo('#progress-record',{scale:1.025,y:14},{scale:1,y:0,duration:0.65,ease:'power3.out'},0);
   tl.to('#progress-record',{scale:1.025,x:6,y:0,duration:0.9,ease:'power2.inOut'},0.85);`,
);

await scene(
  '06-portrait',
  7.5,
  `<div class="clip layer" data-start="0" data-duration="3.5" data-track-index="0"><div id="hero-reveal"><img class="full-photo" src="assets/images/potato-hero.png" alt="The fictional potato fashion portrait"/></div></div>
   <div class="clip layer" data-start="2.5" data-duration="1" data-track-index="1"><div id="splash-reveal"><img class="full-photo" src="assets/images/potato-splash.png" alt="Potato suspended in a studio water splash"/></div></div>
   <div class="clip layer" data-start="3.5" data-duration="4" data-track-index="2"><div id="end-card"><img class="brand-logo" src="assets/prophoto-study-trimmed.svg" alt="ProPhoto Study"/><h1 class="display tagline">Щоб аж йой</h1><p class="end-note">Від уроку — до власного кадру</p><p class="end-url">prophotoacademy.com.ua</p></div></div>`,
  `tl.fromTo('#hero-reveal',{scale:1.025},{scale:1.085,duration:2.5,ease:'power2.inOut'},0);
   tl.fromTo('#splash-reveal',{scale:1.08},{scale:1,duration:1,ease:'power2.out'},2.5);
   tl.fromTo('.brand-logo',{y:16,opacity:0},{y:0,opacity:1,duration:0.55,ease:'power3.out'},3.5);
   tl.fromTo('.tagline',{y:32,opacity:0},{y:0,opacity:1,duration:0.65,ease:'power3.out'},4.1);
   tl.fromTo('.end-note',{opacity:0},{opacity:1,duration:0.6},4.5);
   tl.fromTo('.end-url',{opacity:0},{opacity:1,duration:0.5},5);`,
  `#end-card{height:1080px;display:flex;align-items:center;flex-direction:column;padding:200px 120px 110px;background:#101211}.brand-logo{width:335px;height:auto;filter:invert(1);display:block}.tagline{font-size:132px;margin-top:76px}.end-note{font-size:34px;margin-top:35px;color:#B9BDB4}.end-url{font-size:28px;letter-spacing:1px;margin-top:98px;color:#D5E4B9}`,
);

const voice = [
  [0.5, 0.04, 1.6, 'Підборіддя трохи вище'],
  [3.7, 1.78, 2.08, 'Навіть для такого кадру потрібен план'],
  [6.05, 3.9, 1.25, 'Менеджер готує урок'],
  [7.5, 5.17, 0.89, 'додає матеріали'],
  [9.3, 6.04, 1.15, 'й публікує курс'],
  [11.9, 7.35, 1.15, 'Відкриває доступ'],
  [17.15, 8.52, 1.35, 'Студент дивиться, пробує'],
  [21.25, 9.93, 1.89, 'повертається до збереженого уроку'],
  [24.95, 12.07, 1.47, 'А менеджер бачить прогрес'],
  [28.1, 13.63, 1.2, 'Оце вже мистецтво'],
  [31.25, 15.08, 0.84, 'ПроФото'],
  [32.5, 16.0, 0.928, 'Щоб аж йой'],
];
for (const [i, [, source, duration]] of voice.entries()) {
  const result = spawnSync(
    ffmpeg,
    [
      '-y',
      '-loglevel',
      'error',
      '-ss',
      String(source),
      '-i',
      'assets/audio/campaign-take-3.mp3',
      '-t',
      String(duration),
      '-ar',
      '48000',
      '-ac',
      '1',
      `assets/audio/vo-${String(i + 1).padStart(2, '0')}.wav`,
    ],
    { encoding: 'utf8', windowsHide: true },
  );
  if (result.status !== 0) throw new Error(result.stderr);
}
await writeFile(
  'assets/audio/edit-map.json',
  JSON.stringify(
    voice.map(([start, source, duration, text]) => ({ start, source, duration, text })),
    null,
    2,
  ) + '\n',
);
const slots = [
  ['01-model', 0, 3.5],
  ['02-lesson', 3.5, 8],
  ['03-access', 11.5, 4],
  ['04-student', 15.5, 9],
  ['05-progress', 24.5, 3],
  ['06-portrait', 27.5, 7.5],
];
const masterFx = {
  version: 1,
  nodes: [{ type: 'truepeak', id: 'ceiling', params: { ceiling: -3 } }],
};
const root = `<!doctype html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920,height=1080"><script src="assets/vendor/gsap.min.js"></script><style>${base}html,body{width:1920px;height:1080px;overflow:hidden;background:#101211}.scene{position:absolute;inset:0;width:1920px;height:1080px}.caption{position:absolute;left:120px;right:120px;bottom:38px;height:68px;display:flex;align-items:center;justify-content:center;font:36px/1.35 Manrope,sans-serif;z-index:80;color:#F2EFE7}.caption span{display:inline-block;background:#101211;padding:12px 28px;border-radius:12px}.demo{position:absolute;right:120px;top:91px;color:#B9BDB4;font:22px/1.3 Manrope,sans-serif;z-index:80}</style></head><body><div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="35" data-fx-chain="${json(masterFx)}">
${slots.map(([id, start, duration]) => `<div id="mount-${id}" class="scene clip" data-composition-id="${id}" data-composition-src="compositions/frames/${id}.html" data-start="${start}" data-duration="${duration}" data-track-index="1"></div>`).join('\n')}
<div id="demo-disclosure" class="clip demo" data-start="3.5" data-duration="24" data-track-index="40">Тестові акаунти · оплата вимкнена</div>
${voice.map(([start, , duration, text], i) => `${i < 10 ? `<div id="caption-${i + 1}" class="clip caption" data-start="${start}" data-duration="${Math.max(duration, 1.3)}" data-track-index="30" data-layout-allow-caption-zone><span>${text}</span></div>` : ''}<audio id="voice-${i + 1}" src="assets/audio/vo-${String(i + 1).padStart(2, '0')}.wav" data-audio-group="voiceover" data-start="${start}" data-duration="${duration}" data-track-index="10" data-volume="0.86"></audio>`).join('\n')}
<audio id="music" src="assets/audio/campaign-score.mp3" data-audio-group="music" data-start="3" data-duration="32" data-track-index="11" data-volume="0.65" data-automation="${json(
  {
    version: 1,
    lanes: [
      {
        target: 'volume',
        points: [
          { t: 0, v: 0 },
          { t: 0.3, v: 0.65 },
          { t: 29.9, v: 0.65 },
          { t: 31.8, v: 0 },
        ],
      },
    ],
  },
)}"></audio>
<audio id="sfx-shutter-mark" src="assets/audio/double-shutter.mp3" data-audio-group="sfx" data-start="33.65" data-duration="1.2" data-track-index="12" data-volume="0.6"></audio>
</div><script>window.__timelines['main']=gsap.timeline({paused:true});</script></body></html>`;
await writeFile('index.html', root);
await writeFile(
  'compositions/frames/01-model.motion.json',
  JSON.stringify(
    { duration: 3.5, assertions: [{ kind: 'appearsBy', selector: '#potato-first', bySec: 0.1 }] },
    null,
    2,
  ),
);
const tc = (seconds) => {
  const ms = Math.round(seconds * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};
await writeFile(
  'renders/prophoto-workflow-yoi.uk.srt',
  voice
    .map(
      ([start, , duration, text], i) =>
        `${i + 1}\n${tc(start)} --> ${tc(start + duration)}\n${text}\n`,
    )
    .join('\n'),
);
console.log('Built six workflow scenes, narration clips, and Ukrainian subtitles');
