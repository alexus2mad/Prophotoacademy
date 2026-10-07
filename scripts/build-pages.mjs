import {cp,mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawn} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const stage=path.resolve(root,'.pages-build');const output=path.resolve(root,'pages-out');
const basePath=process.env.PAGES_BASE_PATH||'/Prophotoacademy';
const origin=process.env.PAGES_ORIGIN||'https://alexus2mad.github.io';
if(!/^\/[A-Za-z0-9_-]+$/.test(basePath)||new URL(origin).protocol!=='https:')throw new Error('Invalid Pages URL');
for(const target of [stage,output]){if(path.dirname(target)!==path.resolve(root)||!['.pages-build','pages-out'].includes(path.basename(target)))throw new Error('Unsafe generated directory');await rm(target,{recursive:true,force:true});}
await mkdir(stage,{recursive:true});
await cp(path.join(root,'src'),path.join(stage,'src'),{recursive:true});
await cp(path.join(root,'public'),path.join(stage,'public'),{recursive:true,filter:source=>!source.endsWith('-original.jpg')});
for(const name of ['package.json','postcss.config.mjs','tsconfig.json'])await cp(path.join(root,name),path.join(stage,name));
await mkdir(path.join(stage,'content'),{recursive:true});
const content=JSON.parse(await readFile(path.join(root,'content/academy.json'),'utf8'));
for(const image of content.images)image.src=basePath+image.src;
await writeFile(path.join(stage,'content/academy.json'),JSON.stringify(content));
const site=origin+basePath;
await writeFile(path.join(stage,'next.config.mjs'),`export default {output:'export',basePath:${JSON.stringify(basePath)},assetPrefix:${JSON.stringify(basePath)},trailingSlash:true,images:{unoptimized:true},turbopack:{root:${JSON.stringify(path.resolve(root))}}};\n`);
await writeFile(path.join(stage,'src/lib/content.ts'),`import fixture from '../../content/academy.json';
import type {AcademyContent} from './types';
export async function getContent():Promise<AcademyContent>{return fixture as AcademyContent;}
export function findImage(content:AcademyContent,id:string){const image=content.images.find(i=>i.id===id);if(!image)throw new Error('Missing image '+id);return image;}
export function findOffering(content:AcademyContent,id:string){return content.offerings.filter(o=>o.programId===id).sort((a,b)=>(b.startDate||'').localeCompare(a.startDate||''))[0];}
`);
for(const name of ['api','studio','operations'])await rm(path.join(stage,'src/app',name),{recursive:true,force:true});
await rm(path.join(stage,'src/proxy.ts'),{force:true});
let layout=await readFile(path.join(stage,'src/app/layout.tsx'),'utf8');
layout=layout.replace("import {draftMode} from 'next/headers';", "import {ReviewNotice} from '@/components/review-notice';").replace('const preview=(await draftMode()).isEnabled;','const preview=false;').replace('title:\'ProPhoto\',','title:\'ProPhoto\',robots:{index:false,follow:false},').replace('{preview&&<PreviewBanner/>}','<ReviewNotice/>');
await writeFile(path.join(stage,'src/app/layout.tsx'),layout);
await writeFile(path.join(stage,'src/app/(academy)/checkout/page.tsx'),`import Link from 'next/link';
export default function CheckoutReview(){return <div className="container status-panel"><h1>Оформлення навчання</h1><p>У GitHub-огляді заявки й оплата недоступні. Тут можна переглянути програми, пакети та дизайн сайту.</p><Link className="button" href="/courses">До програм</Link></div>;}
`);
await writeFile(path.join(stage,'src/app/(academy)/thanks/page.tsx'),`import Link from 'next/link';
export default function ThanksReview(){return <div className="container status-panel"><h1>Статус замовлення</h1><p>Оглядова версія не створює замовлень і не приймає платежів.</p><Link className="button" href="/courses">До програм</Link></div>;}
`);
await writeFile(path.join(stage,'src/app/(academy)/courses/page.tsx'),`import {getContent} from '@/lib/content';import {ReviewCatalog} from '@/components/review-catalog';
export default async function Courses(){return <ReviewCatalog content={await getContent()}/>;}
`);
await writeFile(path.join(stage,'src/components/review-catalog.tsx'),`'use client';
import Link from 'next/link';import {useEffect,useState} from 'react';import type {AcademyContent} from '@/lib/types';import {findOffering} from '@/lib/content';import {prioritizePrograms} from '@/lib/program-priority';import {CatalogFilters} from './catalog-filters';import {CourseCard} from './course-card';import {Consultation} from './footer';
export function ReviewCatalog({content}:{content:AcademyContent}){const [filters,setFilters]=useState<{type?:string;format?:string;level?:string}>({});useEffect(()=>{const query=new URLSearchParams(location.search);setFilters({type:query.get('type')||'',format:query.get('format')||'',level:query.get('level')||''});},[]);const programs=prioritizePrograms(content.programs,content.settings.primaryProgramId).filter(p=>(!filters.type||p.category===filters.type)&&(!filters.level||p.level===filters.level||p.level==='all')&&(!filters.format||findOffering(content,p.id)?.format===filters.format||findOffering(content,p.id)?.format==='hybrid'));return <><div className="container"><div className="page-heading catalog-heading"><h1>Усі програми</h1><p className="lead muted">Курси, класи та індивідуальні формати навчання.</p></div><CatalogFilters key={JSON.stringify(filters)} {...filters} count={programs.length}/>{programs.length?<div className="course-grid">{programs.map(p=><CourseCard key={p.id} program={p} content={content}/>)}</div>:<div className="empty-state"><h2>Поки немає такого поєднання</h2><p className="muted">Спробуйте інший формат.</p><Link className="button" href="/courses">Скинути фільтри</Link></div>}</div><Consultation/></>;}
`);
await writeFile(path.join(stage,'src/app/hub/booking/page.tsx'),`import {getContent} from '@/lib/content';import {ReviewBooking} from '@/components/review-booking';
export default async function Booking(){const content=await getContent();return <div className="booking-page container"><ReviewBooking rooms={content.rooms} providerUrl={content.hub.bookingUrl} phone={content.hub.phone}/></div>;}
`);
await writeFile(path.join(stage,'src/components/review-booking.tsx'),`'use client';
import {useEffect,useState} from 'react';import type {StudioRoom} from '@/lib/types';import {StudioBooking} from './studio-booking';
export function ReviewBooking({rooms,providerUrl,phone}:{rooms:StudioRoom[];providerUrl:string;phone:string}){const [key,setKey]=useState('');useEffect(()=>{setKey(new URLSearchParams(location.search).get('room')||'');},[]);const room=rooms.find(r=>r.bookingKey===key);return <StudioBooking providerUrl={providerUrl} roomKey={room?.bookingKey} roomTitle={room?.title} phone={phone}/>;}
`);
const detail=path.join(stage,'src/app/(academy)/[slug]/page.tsx');
await writeFile(detail,(await readFile(detail,'utf8'))+`\nexport const dynamicParams=false;\nexport async function generateStaticParams(){const content=await getContent();return [...content.programs,...content.pages].map(item=>({slug:item.slug}));}\n`);
const hubDetail=path.join(stage,'src/app/hub/[slug]/page.tsx');await writeFile(hubDetail,(await readFile(hubDetail,'utf8'))+'\nexport const dynamicParams=false;\n');
const robots=path.join(stage,'src/app/hub/robots.txt/route.ts');await writeFile(robots,(await readFile(robots,'utf8'))+"\nexport const dynamic='force-static';\n");
await writeFile(path.join(stage,'src/app/robots.ts'),`export const dynamic='force-static';export default function robots(){return {rules:{userAgent:'*',disallow:'/'}};}\n`);
for(const relative of ['src/app/sitemap.ts','src/app/hub/sitemap.ts']){const file=path.join(stage,relative);await writeFile(file,(await readFile(file,'utf8'))+"\nexport const dynamic='force-static';\n");}
await writeFile(path.join(stage,'src/app/hub/robots.txt/route.ts'),`export const dynamic='force-static';export function GET(){return new Response('User-agent: *\\nDisallow: /\\n',{headers:{'Content-Type':'text/plain'}});}\n`);
await appendReviewCss();
async function appendReviewCss(){const file=path.join(stage,'src/app/ecosystem.css');await writeFile(file,(await readFile(file,'utf8'))+'\n.review-notice { display:flex;align-items:center;justify-content:center;gap:24px;min-height:34px;padding:6px 16px;background:var(--surface);border-bottom:1px solid var(--border);color:var(--secondary);font-size:11px;line-height:18px; }.review-notice a { text-decoration:underline;text-underline-offset:3px; }\n@media(max-width:767px){.review-notice { gap:12px;font-size:10px; }}\n');}
async function adaptFiles(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await adaptFiles(file);else if(/\.(ts|tsx)$/.test(file)){let text=await readFile(file,'utf8');text=text.replace(/(["'])(\/(?:images|brand)\/[^"']*)\1/g,(_,quote,value)=>quote+basePath+value+quote).replace(/(<a\b[^>]*\bhref=)(["'])(\/[^"']*)\2/g,(_,start,quote,value)=>start+quote+basePath+value+quote).replace("privacyUrl='/privacy-policy'",`privacyUrl='${basePath}/privacy-policy'`);if(entry.name==='catalog-filters.tsx')text=text.replace('action="/courses"',`action="${basePath}/courses/"`);await writeFile(file,text);}}}
await adaptFiles(path.join(stage,'src'));
const env={...process.env,CONTENT_MODE:'fixture',PROPHOTO_SITE:'auto',NEXT_PUBLIC_REVIEW_MODE:'pages',NEXT_PUBLIC_SITE_URL:site,NEXT_PUBLIC_ACADEMY_URL:site,NEXT_PUBLIC_HUB_URL:site+'/hub',NEXT_PUBLIC_GA_MEASUREMENT_ID:'',NEXT_TELEMETRY_DISABLED:'1'};
await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build',stage],{cwd:root,env,stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error('Pages build failed: '+code)));});
await cp(path.join(stage,'out'),output,{recursive:true});await writeFile(path.join(output,'.nojekyll'),'');
console.log('Review export ready at '+output+' → '+site+'/');
