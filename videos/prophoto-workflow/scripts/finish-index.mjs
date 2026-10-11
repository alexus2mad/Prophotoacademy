import {readFile,writeFile} from 'node:fs/promises';
const project=new URL('../',import.meta.url);
let html=await readFile(new URL('index.html',project),'utf8');
const cues=JSON.parse(await readFile(new URL('caption-cues.json',project),'utf8'));
const escape=(s)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const captions=cues.map((cue,i)=>{
 const end=Math.min(cue.end,cues[i+1]?.start??54.5);
 return `<p id="narration-caption-${i}" class="clip narration-caption" data-start="${cue.start}" data-duration="${(end-cue.start).toFixed(3)}" data-track-index="30" data-layout-allow-caption-zone>${escape(cue.text)}</p>`;
}).join('\n');
const styles=`<style id="film-finishing-styles">
@font-face{font-family:Manrope;src:url('assets/fonts/manrope-0.woff2') format('woff2');font-weight:400}
.narration-caption{position:absolute!important;inset:auto 0 0!important;width:100%;height:184px!important;display:flex;justify-content:center;align-items:center;z-index:80;box-sizing:border-box;background:#101211}
.narration-caption{color:#F2EFE7;font-family:Manrope,sans-serif;font-weight:400;font-size:30px;line-height:1.4;text-align:center;margin:0;padding:0 240px}
.demo-disclosure{position:absolute!important;inset:32px 96px auto auto!important;width:auto!important;height:auto!important;z-index:81;color:#B9BDB4;font:400 20px/1.3 Manrope,sans-serif}
</style>`;
html=html.replace('</head>',`${styles}\n</head>`);
html=html.replace(/(<div[^>]+id="root"[^>]*>)/,`$1\n${captions}\n<div id="film-demo-disclosure" class="clip demo-disclosure" data-start="5.5" data-duration="40" data-track-index="31">Демонстрація · тестові дані</div>`);
// Leave headroom for the music bed under the generated narration peaks.
html=html.replace(/<audio\b[^>]*src="assets\/audio\/scene-\d+\.wav"[^>]*>/g,tag=>tag.replace(/data-volume="[^"]*"/,'data-volume="0.75"'));
const automation={version:1,lanes:[{target:'volume',points:[{t:0,v:0},{t:.4,v:.36},{t:1,v:.28},{t:44.8,v:.28},{t:45.5,v:.36},{t:46.1,v:.28},{t:52.9,v:.32},{t:54.5,v:0}]}]};
html=html.replace(/(<audio\b[^>]*src="assets\/audio\/score.mp3"[^>]*)(>)/,(_,open,end)=>open.replace(/data-volume="[^"]*"/,'data-volume="1"')+` data-automation="${escape(JSON.stringify(automation))}"`+end);
await writeFile(new URL('index.html',project),html);
const srtTime=(t)=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
await writeFile(new URL('captions.uk.srt',project),cues.map((c,i)=>`${i+1}\n${srtTime(c.start)} --> ${srtTime(Math.min(c.end,cues[i+1]?.start??54.5))}\n${c.text}\n`).join('\n'));
console.log('Finished sentence captions, demo disclosure, and music envelope');
