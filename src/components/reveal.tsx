'use client';
import {useEffect} from 'react';

export function EditorialMotion() {
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
    const nodes=[...document.querySelectorAll<HTMLElement>('[data-editorial-reveal]')];
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.removeAttribute('data-reveal-ready');observer.unobserve(entry.target);}},{threshold:0.08});
    for(const node of nodes)if(node.getBoundingClientRect().top>window.innerHeight+24){node.setAttribute('data-reveal-ready','');observer.observe(node);}
    return ()=>{observer.disconnect();for(const node of nodes)node.removeAttribute('data-reveal-ready');};
  },[]);
  return null;
}
