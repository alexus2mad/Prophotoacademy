import type {Metadata} from 'next';
import {OrderStatus} from '@/components/order-status';
import Link from 'next/link';
export const metadata:Metadata={title:'Статус замовлення',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function Thanks({searchParams}:{searchParams:Promise<{token?:string}>}){const {token}=await searchParams;if(!token||!/^[a-f0-9]{64}$/.test(token))return <div className="container status-panel"><h1>Дякуємо за інтерес до академії</h1><p>Перегляньте програми або зв’яжіться з нами, щоб обрати навчання.</p><Link href="/courses" className="button">До програм</Link></div>;return <OrderStatus token={token}/>;}
