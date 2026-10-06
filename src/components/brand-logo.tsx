import Image from 'next/image';

export function BrandLogo({large=false}:{large?:boolean}) {
  return <Image src="/brand/prophoto-study-trimmed.svg" alt="ProPhoto Study — академія фотографії" width={1609} height={406} className={`brand-logo ${large?'brand-logo-large':''}`} unoptimized/>;
}
