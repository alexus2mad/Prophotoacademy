import {readFile,writeFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const project=fileURLToPath(new URL('../',import.meta.url));
const workflow=process.env.HYPERFRAMES_WORKFLOW_SCRIPTS || join(process.env.USERPROFILE || process.env.HOME,'.agents/skills/product-launch-video/scripts');
process.chdir(project);
for(const file of await readdir('compositions/frames')){
 if(!file.endsWith('.html'))continue;
 const path=join('compositions/frames',file);
 let html=await readFile(path,'utf8');
 html=html.replace(/#root\s*\{[^}]*\}/g,css=>css.replace(/width:\s*1920px/g,'width:100%').replace(/height:\s*1080px/g,'height:100%'));
 html=html.replaceAll('capture/assets/','assets/').replaceAll('capture/screenshots/','assets/');
 html=html.replace(/https:\/\/(?:cdn\.jsdelivr\.net\/npm\/gsap@[^/]+\/dist|cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/[^/]+)\/gsap\.min\.js/g,'assets/vendor/gsap.min.js');
 await writeFile(path,html);
}
let storyboard=await readFile('STORYBOARD.md','utf8');
await writeFile('STORYBOARD.md',storyboard.replaceAll('- status: outline','- status: animated'));
const run=(script,args)=>execFileSync(process.execPath,[join(workflow,script),...args],{stdio:'inherit'});
run('assemble-index.mjs',['--storyboard','STORYBOARD.md','--hyperframes','.']);
run('transitions.mjs',['inject','--storyboard','STORYBOARD.md','--hyperframes','.']);
run('transitions.mjs',['verify','--storyboard','STORYBOARD.md','--index','index.html']);
let html=await readFile('index.html','utf8');
html=html.replaceAll('https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js','assets/vendor/gsap.min.js').replace('lang="en"','lang="uk"');
await writeFile('index.html',html);
execFileSync(process.execPath,['scripts/finish-index.mjs'],{stdio:'inherit'});
