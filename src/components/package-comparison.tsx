'use client';

import Link from 'next/link';
import {useRef,useState} from 'react';
import {X} from 'lucide-react';
import type {Package} from '@/lib/types';
import {money} from '@/lib/format';

export type ComparisonPackage=Package&{statusLabel:string;purchaseUrl?:string;inquiryAllowed:boolean};
export function PackageComparison({packages,programId,offeringId,programTitle}:{packages:ComparisonPackage[];programId:string;offeringId:string;programTitle:string}){
 const dialog=useRef<HTMLDialogElement>(null);const [first,setFirst]=useState(packages[0].id);const [second,setSecond]=useState(packages.at(-1)!.id);
 function inquire(pack:ComparisonPackage){dialog.current?.close();window.dispatchEvent(new CustomEvent('academy:inquiry',{detail:{programId,offeringId,packageId:pack.id,title:`${programTitle}: ${pack.name}`}}));}
 function table(items:ComparisonPackage[]){return <table className="comparison-table"><caption className="sr-only">Порівняння пакетів програми {programTitle}</caption><thead><tr><td/><>{items.map(pack=><th scope="col" key={pack.id}>{pack.name}</th>)}</></tr></thead><tbody>
  <tr><th scope="row">Вартість</th>{items.map(pack=><td key={pack.id}><strong className="comparison-price">{money(pack.price)}</strong></td>)}</tr>
  <tr><th scope="row">Формат підтримки</th>{items.map(pack=><td key={pack.id}>{pack.description}</td>)}</tr>
  <tr><th scope="row">Що входить</th>{items.map(pack=><td key={pack.id}><ul>{pack.includes.map(item=><li key={item}>{item}</li>)}</ul></td>)}</tr>
  <tr><th scope="row">Наявність</th>{items.map(pack=><td key={pack.id}><span className="comparison-status">{pack.statusLabel}</span></td>)}</tr>
  <tr><th scope="row"><span className="sr-only">Запис</span></th>{items.map(pack=><td key={pack.id}>{pack.purchaseUrl?<Link className="text-link" href={pack.purchaseUrl} onClick={()=>dialog.current?.close()} aria-label={`Обрати ${pack.name}`}>Обрати</Link>:pack.inquiryAllowed?<button className="text-link" onClick={()=>inquire(pack)} aria-label={`Уточнити ${pack.name}`}>Уточнити</button>:<span className="muted">Набір завершено</span>}</td>)}</tr>
 </tbody></table>;}
 const selected=[packages.find(pack=>pack.id===first)!,packages.find(pack=>pack.id===second)!];
 return <><button className="text-link compare-trigger" onClick={()=>dialog.current?.showModal()} aria-haspopup="dialog" aria-label="Порівняти пакети"><span className="compare-label"><span className="compare-long">Порівняти пакети</span><span className="compare-short">Порівняти</span></span></button>
  <dialog ref={dialog} className="dialog package-comparison-dialog" aria-labelledby="comparison-title" onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}>
   <button className="icon-button dialog-close" aria-label="Закрити порівняння" onClick={()=>dialog.current?.close()}><X size={22}/></button>
   <h2 id="comparison-title">Порівняння пакетів</h2>
   <div className="comparison-desktop">{table(packages)}</div>
   <div className="comparison-mobile">{packages.length>2&&<div className="comparison-selectors"><div><label htmlFor="comparison-first">Перший пакет</label><select id="comparison-first" value={first} onChange={event=>setFirst(event.target.value)}>{packages.map(pack=><option key={pack.id} value={pack.id} disabled={pack.id===second}>{pack.name}</option>)}</select></div><div><label htmlFor="comparison-second">Другий пакет</label><select id="comparison-second" value={second} onChange={event=>setSecond(event.target.value)}>{packages.map(pack=><option key={pack.id} value={pack.id} disabled={pack.id===first}>{pack.name}</option>)}</select></div></div>}{table(selected)}</div>
  </dialog>
 </>;
}
