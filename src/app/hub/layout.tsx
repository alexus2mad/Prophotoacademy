import type {Metadata} from 'next';
import {getContent} from '@/lib/content';
import {canonicalUrl} from '@/lib/ecosystem';
import {Header} from '@/components/header';
import {HubFooter} from '@/components/hub-footer';
import {InquiryDialog} from '@/components/inquiry';
export const metadata:Metadata={metadataBase:new URL(canonicalUrl('hub')),title:{default:'ProPhoto Hub — фотостудія в Києві',template:'%s · ProPhoto Hub'},description:'Циклорама, подкаст-зала та гримерна в центрі Києва. Тарифи, фотографії залів і онлайн-бронювання.',openGraph:{siteName:'ProPhoto Hub',images:[{url:new URL('/images/hub-cyclorama.webp',canonicalUrl('hub')).href,width:1800,height:1200}]}};
export default async function HubLayout({children}:{children:React.ReactNode}){
  const content=await getContent();
  return <><Header site="hub"/><main id="main">{children}</main><HubFooter settings={content.hub}/><InquiryDialog site="hub" privacyUrl={content.hub.privacyUrl}/></>;
}
