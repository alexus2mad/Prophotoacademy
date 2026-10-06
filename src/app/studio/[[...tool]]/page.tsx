import {NextStudio} from 'next-sanity/studio';
import config from '../../../../sanity.config';
import Link from 'next/link';
export const dynamic='force-dynamic';
export const metadata={title:'Content Studio',robots:{index:false,follow:false}};
export default function Studio(){if(!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)return <div className="container status-panel"><h1>Sanity Studio готова до підключення</h1><p>Вкажіть project ID та dataset у локальному .env.local і виконайте міграцію. Studio використовує авторизацію Sanity.</p><Link href="/" className="button">До сайту</Link></div>;return <div style={{height:'calc(100dvh - 72px)'}}><NextStudio config={config}/></div>;}
