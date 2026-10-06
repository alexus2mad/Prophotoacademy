import sharp from 'sharp';
import {readdir,writeFile} from 'node:fs/promises';
const manifest={};
for(const file of await readdir('public/images')) {
  if(!file.endsWith('-original.jpg')) continue;
  const name=file.replace('-original.jpg','');
  const original=sharp(`public/images/${file}`).rotate();
  const metadata=await original.metadata();
  const result=await original.resize({width: name==='hero'?1800:1200,withoutEnlargement:true}).webp({quality:85,effort:5}).toFile(`public/images/${name}.webp`);
  manifest[name]={src:`/images/${name}.webp`,width:result.width,height:result.height,bytes:result.size,originalWidth:metadata.width,originalHeight:metadata.height};
  console.log(`${name}: ${result.width}×${result.height}, ${Math.round(result.size/1024)} KB`);
}
await writeFile('content/media-metadata.json',JSON.stringify(manifest,null,2));
