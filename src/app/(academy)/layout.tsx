import {EcosystemMeasurement} from '@/components/ecosystem-measurement';
import type {Metadata} from 'next';
import {getContent} from '@/lib/content';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import {InquiryDialog} from '@/components/inquiry';
export const metadata:Metadata={title:{default:'Pro Photo Academy — створюйте кадри, які працюють',template:'%s · Pro Photo Academy'},description:'Курси фотографії, відео та створення контенту на телефон і камеру. Онлайн і в Києві.',openGraph:{siteName:'Pro Photo Academy',images:[{url:'/images/hero.webp',width:1800,height:1200}]}};
export default async function AcademyLayout({children}:{children:React.ReactNode}){
  const content=await getContent();
  return <><EcosystemMeasurement site="academy"/><Header site="academy"/><main id="main">{children}</main><Footer settings={content.settings}/><InquiryDialog site="academy"/></>;
}
