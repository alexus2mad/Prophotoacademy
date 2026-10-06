'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {Menu,X} from 'lucide-react';
import {BrandLogo} from './brand-logo';
const links=[['/courses','Програми'],['/student-work','Роботи студентів'],['/about-us','Академія']];
export function Header() {
  const path=usePathname();
  const [scrolled,setScrolled]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const update=()=>setScrolled(window.scrollY>12);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update);},[]);
  return <header className={`site-header ${scrolled?'is-scrolled':''}`}><div className="container header-inner">
    <Link href="/" className="brand-link" aria-label="Pro Photo Academy — головна"><BrandLogo/></Link>
    <nav className="desktop-nav" aria-label="Головна навігація">{links.filter(([href])=>href!=='/courses').map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}</nav>
    <div className="header-actions"><Link href="/courses" className={`button button-small ${path==='/'?'button-secondary':''}`} aria-current={path==='/courses'?'page':undefined}>{path==='/'?'Усі програми':'Обрати курс'}</Link><button className="icon-button menu-toggle" onClick={()=>dialog.current?.showModal()} aria-label="Відкрити меню"><Menu size={22}/></button></div>
    <dialog className="dialog menu-dialog" aria-label="Меню академії" ref={dialog}><button className="icon-button dialog-close" onClick={()=>dialog.current?.close()} aria-label="Закрити меню"><X/></button><nav aria-label="Мобільна навігація">{[...links,['/contacts','Контакти']].map(([href,label])=><Link key={href} href={href} onClick={()=>dialog.current?.close()}>{label}</Link>)}</nav></dialog>
  </div></header>;
}
