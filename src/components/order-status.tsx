'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {Check,Clock,X} from 'lucide-react';
import {InquiryButton} from './inquiry';
type Status={status:'pending'|'approved'|'declined'|'canceled'|'refunded';mode:'mock'|'wayforpay';retryUrl:string;programTitle:string;packageName:string};
const labels={pending:['Очікуємо підтвердження','Щойно платіжна система підтвердить оплату, статус замовлення оновиться.'],approved:['Ваше навчання починається','Оплату підтверджено. Команда академії зв’яжеться з вами для надання доступу та організаційних деталей.'],declined:['Оплату не підтверджено','Платіж відхилено. Повторіть оформлення або зверніться до академії.'],canceled:['Оплату скасовано','Кошти за цим замовленням не підтверджені. Ви можете обрати програму знову.'],refunded:['Оплату повернено','Повернення підтверджено платіжною системою. За деталями зверніться до академії.']};
export function OrderStatus({token}:{token:string}) {
 const [order,setOrder]=useState<Status>();const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const refresh=useCallback(async()=>{try{const response=await fetch(`/api/orders/status?token=${encodeURIComponent(token)}`,{cache:'no-store'});if(!response.ok)throw new Error('Замовлення не знайдено або посилання недійсне.');setOrder(await response.json());setError('');}catch(error){setError(error instanceof Error?error.message:'Не вдалося оновити статус.');}},[token]);
 useEffect(()=>{void refresh();},[refresh]);
 useEffect(()=>{if(order?.status!=='pending')return;let checks=0;const timer=setInterval(()=>{void refresh();if(++checks>=30)clearInterval(timer);},2000);return()=>clearInterval(timer);},[order?.status,refresh]);
 async function simulate(status:string){setBusy(true);try{const response=await fetch('/api/payments/mock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,status})});if(!response.ok)throw new Error('Не вдалося змінити демо-статус.');await refresh();}catch(error){setError(error instanceof Error?error.message:'Спробуйте ще раз.');}finally{setBusy(false);}}
 const label=order?labels[order.status]:['Перевіряємо замовлення','Зачекайте кілька секунд.'];
 return <div className="container status-panel">{order?.status==='approved'?<Check size={40}/>:order?.status==='pending'?<Clock size={40}/>:<X size={40}/>}<h1>{label[0]}</h1><p>{label[1]}</p>{order&&<p>{order.programTitle}<br/>{order.packageName}</p>}{error&&<p className="form-error" role="alert">{error}</p>}{(!order||order.status==='pending')&&<button className="button button-secondary" onClick={refresh}>Оновити статус</button>}{order?.mode==='mock'&&<div className="mock-notice"><strong>Локальна демонстрація. Реального платежу немає.</strong>{order.status==='pending'&&<div className="mock-actions">{[['approved','Успішно'],['pending','Очікування'],['declined','Відмова'],['canceled','Скасування']].map(([status,title])=><button className="text-link" key={status} onClick={()=>simulate(status)} disabled={busy}>{title}</button>)}</div>}</div>}{order&&["declined","canceled"].includes(order.status)&&<Link href={order.retryUrl} className="button">Повторити оформлення</Link>}<InquiryButton className="text-link">Потрібна допомога</InquiryButton><Link href="/courses" className="text-link">До програм</Link></div>;
}


