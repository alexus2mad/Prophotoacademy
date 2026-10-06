'use client';
import {useEffect,useState} from 'react';
import {money} from '@/lib/format';

export function MobileEnrollment({price,children}:{price?:number;children:React.ReactNode}){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const action=document.querySelector('.program-hero-actions');if(!action||!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(([entry])=>setVisible(!entry.isIntersecting&&entry.boundingClientRect.bottom<=88),{rootMargin:'-88px 0px 0px 0px',threshold:0});
  observer.observe(action);return()=>observer.disconnect();
 },[]);
 return <div className="mobile-enroll" data-visible={visible} aria-hidden={!visible} inert={!visible}>{price!==undefined?<a href="#packages" className="mobile-price-link"><strong>від {money(price)}</strong><span>Пакети й вартість</span></a>:<p>Ваш особистий формат<span>Почнемо з вашої мети</span></p>}{children}</div>;
}
