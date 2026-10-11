import { readFile, writeFile, copyFile, readdir, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const durations = [5.5,11,8.5,8.5,12,9];
const narration = JSON.parse((await readFile(`${root}/narration.json`,'utf8')).replace(/^\uFEFF/,''));
const voices=[],captions=[];
let start=0;
for(let i=0;i<narration.clips.length;i++){
  const clip=narration.clips[i],out=`assets/audio/scene-${clip.id}.wav`;
  execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',`${root}/${clip.file}`,'-af',`adelay=600|600,apad,atrim=0:${durations[i]}`,'-ar','48000',`${root}/${out}`]);
  voices.push({frame:i+1,path:out,duration_s:durations[i]});
  const a=JSON.parse((await readFile(`${root}/${clip.alignment}`,'utf8')).replace(/^\uFEFF/,''));
  if(a?.characters){let text='',begin=0;for(let c=0;c<a.characters.length;c++){
    const char=a.characters[c];if(!text)begin=a.character_start_times_seconds[c];text+=char;
    if(/[.!?]/u.test(char)||c===a.characters.length-1){if(text.trim())captions.push({text:text.trim(),start:+(start+.6+begin).toFixed(3),end:+(start+.6+a.character_end_times_seconds[c]+.14).toFixed(3)});text='';}
  }}
  start+=durations[i];
}
await writeFile(`${root}/audio_meta.json`,JSON.stringify({voices,bgm:{path:'assets/audio/score.mp3',volume:.12},sfx:[]},null,2));
await writeFile(`${root}/caption-cues.json`,JSON.stringify(captions,null,2));
for(const dir of ['capture/assets','capture/screenshots'])for(const file of await readdir(`${root}/${dir}`))await copyFile(`${root}/${dir}/${file}`,`${root}/assets/${file}`);
await mkdir(`${root}/.media`,{recursive:true});
const manifest=[];for(const file of await readdir(`${root}/assets`))if(/\.(jpg|svg)$/i.test(file))manifest.push({path:`assets/${file}`,source:file.endsWith('.svg')?'existing ProPhoto brand library':file.includes('original')?'user Academy photography library':'CUA live sandbox screenshot; synthetic data'});
await writeFile(`${root}/.media/provenance.json`,JSON.stringify(manifest,null,2));
console.log(`Prepared ${voices.length} audio clips, ${captions.length} caption cues, ${start}s`);
