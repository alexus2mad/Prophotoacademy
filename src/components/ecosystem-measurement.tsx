'use client';
import Script from 'next/script';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {decorateEcosystemUrl,getAcquisition} from '@/lib/attribution';
import {academyOrigin,hubOrigin} from '@/lib/ecosystem';
declare global {interface Window {dataLayer:unknown[];gtag?:(...args:unknown[])=>void}}
const id=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;const enabled=!!id&&/^G-[A-Z0-9]+$/.test(id);
export function EcosystemMeasurement({site}:{site:'academy'|'hub'}){
 const path=usePathname();const [choice,setChoice]=useState<string|null>(null);
 useEffect(()=>{getAcquisition(site);if(enabled)try{setChoice(localStorage.getItem('prophoto:analytics'));}catch{}},[site]);
 useEffect(()=>{
  const link=(event:MouseEvent)=>{const anchor=(event.target as HTMLElement)?.closest<HTMLAnchorElement>('a[data-ecosystem-target]');if(!anchor||anchor.dataset.ecosystemTarget===site)return;const source=getAcquisition(site);if(source)anchor.href=decorateEcosystemUrl(anchor.href,source);if(choice==='allow')window.gtag?.('event','ecosystem_navigation',{site_brand:site,target_brand:anchor.dataset.ecosystemTarget,offer:anchor.dataset.offer||'navigation'});};
  document.addEventListener('click',link,true);return()=>document.removeEventListener('click',link,true);
 },[site,choice]);
 useEffect(()=>{if(choice==='allow')window.gtag?.('event','page_view',{page_location:location.origin+path,page_title:document.title,site_brand:site});},[path,site,choice]);
 function select(value:'allow'|'deny'){try{localStorage.setItem('prophoto:analytics',value);}catch{}setChoice(value);if(value==='deny')window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});}
 function configure(){
  if(choice!=='allow')return;window.dataLayer??=[];window.gtag??=(...args)=>{window.dataLayer.push(args);};
  window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  const domains=[academyOrigin,hubOrigin].filter(value=>value.startsWith('https://')).map(value=>new URL(value).hostname);
  if(domains.length)window.gtag('set','linker',{domains});
  window.gtag('consent','update',{analytics_storage:'granted'});window.gtag('js',new Date());window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});window.gtag('event','page_view',{page_location:location.origin+path,page_title:document.title,site_brand:site});
 }
 if(!enabled)return null;
 return <>{choice==='allow'&&<Script id="prophoto-analytics" src={'https://www.googletagmanager.com/gtag/js?id='+id} strategy="afterInteractive" onReady={configure}/>}<button className="analytics-preferences" onClick={()=>setChoice(null)}>Налаштування аналітики</button>{choice===null&&<section className="analytics-consent" aria-label="Аналітика сайту"><p>Дозволити аналітику, щоб допомогти нам покращувати навчання та бронювання?</p><div><button className="button button-secondary button-small" onClick={()=>select('deny')}>Без аналітики</button><button className="button button-small" onClick={()=>select('allow')}>Дозволити</button></div></section>}</>;
}
