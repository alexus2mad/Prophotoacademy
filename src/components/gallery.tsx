'use client';
import Image from 'next/image';
import {useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Maximize2,X} from 'lucide-react';
import type {ImageAsset,Work} from '@/lib/types';
export function Gallery({works,images}:{works:Work[];images:ImageAsset[]}) {
  const [index,setIndex]=useState(0);const dialog=useRef<HTMLDialogElement>(null);
  const current=works[index];const image=images.find(i=>i.id===current?.imageId);
  function open(i:number){setIndex(i);dialog.current?.showModal();}
  return <><div className="work-grid">{works.map((work,i)=>{const img=images.find(image=>image.id===work.imageId)!;return <figure className="work-item" key={work.id}><button onClick={()=>open(i)} className="work-image" aria-label={`Відкрити роботу: ${work.title}`}><Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(max-width: 767px) 87vw, (max-width: 1199px) 43vw, 29vw"/><span className="work-open" aria-hidden="true"><Maximize2 size={16}/></span></button><figcaption><span>{work.title}</span><span>{work.device==='phone'?'На телефон':'На камеру'}</span></figcaption></figure>;})}</div>
    <dialog ref={dialog} className="dialog gallery-dialog" aria-label="Перегляд роботи студента" onKeyDown={e=>{if(e.key==='ArrowRight')setIndex(i=>(i+1)%works.length);if(e.key==='ArrowLeft')setIndex(i=>(i-1+works.length)%works.length);}}><button className="icon-button dialog-close" onClick={()=>dialog.current?.close()} aria-label="Закрити фото"><X/></button>{image&&<Image key={image.id} src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="90vw" className="lightbox-image"/>}<div className="lightbox-caption"><button className="icon-button" aria-label="Попереднє фото" onClick={()=>setIndex(i=>(i-1+works.length)%works.length)}><ArrowLeft/></button><p>{current?.title}<span>{image?.credit} · {index+1}/{works.length}</span></p><button className="icon-button" aria-label="Наступне фото" onClick={()=>setIndex(i=>(i+1)%works.length)}><ArrowRight/></button></div></dialog>
  </>;
}
