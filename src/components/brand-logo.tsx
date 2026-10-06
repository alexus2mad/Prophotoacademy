import Image from 'next/image';

export function BrandLogo({large=false,site='academy'}:{large?:boolean;site?:'academy'|'hub'}) {
  if(site==='hub')return <Image src="/brand/prophoto-hub.webp" alt="ProPhoto Hub — фотостудія" width={800} height={281} className={`brand-logo brand-logo-hub ${large?'brand-logo-large':''}`} unoptimized/>;
  return <Image src="/brand/prophoto-study-trimmed.svg" alt="ProPhoto Study — академія фотографії" width={1609} height={406} className={`brand-logo ${large?'brand-logo-large':''}`} unoptimized/>;
}
