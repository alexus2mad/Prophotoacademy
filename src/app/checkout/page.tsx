import type {Metadata} from 'next';
import Link from 'next/link';
import {getContent,findImage} from '@/lib/content';
import {resolvePurchase} from '@/lib/checkout';
import {money} from '@/lib/format';
import {CheckoutForm} from '@/components/checkout-form';
import {Photo} from '@/components/photo';
import {InquiryButton} from '@/components/inquiry';
export const metadata:Metadata={title:'Оформлення навчання',robots:{index:false,follow:false}};
export default async function Checkout({searchParams}:{searchParams:Promise<{offering?:string;package?:string;demo?:string}>}) {
 const query=await searchParams;const content=await getContent();const mock=(process.env.PAYMENT_MODE||'mock')==='mock';
 let purchase;try{purchase=resolvePurchase(content,query.demo==='1'?'demo-offering':query.offering||'',query.demo==='1'?'demo-base':query.package||'');}catch{return <div className="container status-panel"><h1>Уточнімо ваш набір</h1><p>Цей пакет поки недоступний для оплати. Команда підтвердить дату, вартість і наявність місць.</p><InquiryButton className="button">Зв’язатися з академією</InquiryButton><Link href="/courses" className="text-link">Повернутися до програм</Link></div>;}
 const {program,offering,pack}=purchase;
 return <div className="container"><div className="page-heading"><h1>{query.demo==='1'?'Перевірка оформлення':'Оформлення навчання'}</h1><p className="muted">Без реєстрації. Контактні дані потрібні для підтвердження замовлення й доступу до матеріалів.</p></div><div className="checkout-grid"><CheckoutForm offeringId={offering.id} packageId={pack.id} mock={mock}/><aside className="checkout-summary"><div className="checkout-summary-heading"><Photo image={findImage(content,program.imageId)}/><div><p className="eyebrow">{pack.name}</p><h2>{program.shortTitle}</h2></div></div><div className="price">{money(pack.price)}</div><p className="muted">Разова оплата</p>{!!pack.includes.length&&<details className="checkout-includes"><summary>Що входить у пакет</summary><ul className="check-list">{pack.includes.map(item=><li key={item}>{item}</li>)}</ul></details>}</aside></div></div>;
}
