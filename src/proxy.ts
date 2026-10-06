import {NextResponse,type NextRequest} from 'next/server';
import {hubRewritePath,isHubHost} from './lib/ecosystem';
export function proxy(request:NextRequest){
  if(!isHubHost(request.headers.get('host')||'')){
    const base=process.env.NEXT_PUBLIC_HUB_URL;
    if(base?.startsWith('https://')&&(request.nextUrl.pathname==='/hub'||request.nextUrl.pathname.startsWith('/hub/'))){const url=new URL(base);url.pathname=request.nextUrl.pathname.slice(4)||'/';url.search=request.nextUrl.search;return NextResponse.redirect(url,308);}
    return NextResponse.next();
  }
  const url=request.nextUrl.clone();
  if(url.pathname==='/hub'||url.pathname.startsWith('/hub/')){
    url.pathname=url.pathname.slice(4)||'/';
    return NextResponse.redirect(url,308);
  }
  const path=hubRewritePath(url.pathname);
  if(!path)return NextResponse.next();
  url.pathname=path;
  return NextResponse.rewrite(url);
}
export const config={matcher:['/((?!_next/static|_next/image|images/|brand/).*)']};
