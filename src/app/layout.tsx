import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import {InquiryDialog} from '@/components/inquiry';
import {getContent} from '@/lib/content';
import {draftMode} from 'next/headers';
import {PreviewBanner} from '@/components/preview-banner';
import {PhotographyMotion} from '@/components/photography-motion';
import './design-system.css';
const manrope=localFont({src:[{path:'./fonts/manrope-0.woff2',weight:'400',style:'normal'},{path:'./fonts/manrope-1.woff2',weight:'500',style:'normal'},{path:'./fonts/manrope-2.woff2',weight:'600',style:'normal'}],variable:'--font-manrope',display:'swap'});
const kyiv=localFont({src:[{path:'./fonts/kyivtype-regular.woff2',weight:'400',style:'normal'},{path:'./fonts/kyivtype-medium.woff2',weight:'500',style:'normal'}],variable:'--font-display',display:'swap'});
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://127.0.0.1:3000'),title:{default:'Pro Photo Academy — створюйте кадри, які працюють',template:'%s · Pro Photo Academy'},description:'Курси фотографії, відео та створення контенту на телефон і камеру. Онлайн і в Києві. Оберіть програму Pro Photo Academy.',openGraph:{type:'website',locale:'uk_UA',siteName:'Pro Photo Academy',images:[{url:'/images/hero.webp',width:1800,height:1200,alt:'Портрет під водою — робота Олени Попової'}]},twitter:{card:'summary_large_image'}};
export default async function RootLayout({children}:{children:React.ReactNode}) {
  const content=await getContent();
  const preview=(await draftMode()).isEnabled;
  return <html lang="uk" data-scroll-behavior="smooth" className={`${manrope.variable} ${kyiv.variable}`}><body><a className="skip-link" href="#main">Перейти до вмісту</a>{preview&&<PreviewBanner/>}<Header/><main id="main">{children}<PhotographyMotion/></main><Footer settings={content.settings}/><InquiryDialog/></body></html>;
}

