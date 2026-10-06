'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {Menu,X} from 'lucide-react';
import {BrandLogo} from './brand-logo';
import {siteHref} from '@/lib/ecosystem';
import type {SiteBrand} from '@/lib/types';
export function EcosystemNav({site,onNavigate}:{site:SiteBrand;onNavigate?:()=>void}){
 return <nav className="ecosystem-nav" aria-label="Напрями ProPhoto"><a href={siteHref('academy')} aria-current={site==='academy'?'true':undefined} onClick={onNavigate} data-ecosystem-target="academy">Навчання</a><span aria-hidden="true">·</span><a href={siteHref('hub')} aria-current={site==='hub'?'true':undefined} onClick={onNavigate} data-ecosystem-target="hub">Студія</a></nav>;
}
export function Header({site='academy'}:{site?:SiteBrand}){
 const path=usePathname();const [scrolled,setScrolled]=useState(false);const dialog=useRef<HTMLDialogElement>(null);
 const focused=(site==='hub'&&path.endsWith('/booking'))||path==='/checkout'||path==='/thanks';
 const home=site==='academy'?path==='/':path==='/hub'||path==='/';
 const links=site==='hub'?[[siteHref('hub','#spaces'),'Зали'],[siteHref('hub','contact'),'Контакти']]:[['/student-work','Роботи студентів'],['/about-us','Академія']];
 useEffect(()=>{const update=()=>setScrolled(window.scrollY>12);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update);},[]);
 useEffect(()=>{dialog.current?.close();},[path]);
 return <header className={`site-header ${scrolled?'is-scrolled':''} ${focused?'header-focused':''}`}><div className="container header-inner">
 <Link href={siteHref(site)} className="brand-link" aria-label={`${site==='hub'?'ProPhoto Hub':'Pro Photo Academy'} — головна`}><BrandLogo site={site}/></Link>
 {!focused&&<EcosystemNav site={site}/>}
 {!focused&&<nav className="desktop-nav" aria-label="Головна навігація">{links.map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}</nav>}
 <div className="header-actions">{focused?<Link href={siteHref(site,site==='hub'?'':'courses')} className="text-link">{site==='hub'?'До студії':'До програм'}</Link>:<><Link href={siteHref(site,site==='hub'?'booking':'courses')} className={`button button-small ${site==='academy'&&home?'button-secondary':''}`}>{site==='hub'?'Забронювати':home?'Усі програми':'Обрати курс'}</Link><button className="icon-button menu-toggle" onClick={()=>dialog.current?.showModal()} aria-label="Відкрити меню"><Menu size={22}/></button></>}</div>
 <dialog className="dialog menu-dialog" aria-label={site==='hub'?'Меню студії':'Меню академії'} ref={dialog} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}><button className="icon-button dialog-close" onClick={()=>dialog.current?.close()} aria-label="Закрити меню"><X/></button><nav aria-label="Мобільна навігація">{(site==='hub'?[[siteHref('hub','#spaces'),'Зали'],[siteHref('hub','booking'),'Бронювання'],[siteHref('hub','contact'),'Контакти']]:[['/courses','Програми'],...links,['/contacts','Контакти']]).map(([href,label])=><Link key={href} href={href} onClick={()=>dialog.current?.close()}>{label}</Link>)}</nav><EcosystemNav site={site} onNavigate={()=>dialog.current?.close()}/></dialog>
 </div></header>;
}
