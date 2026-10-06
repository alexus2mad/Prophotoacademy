import Image from 'next/image';
import type {ImageAsset} from '@/lib/types';
export function Photo({image,priority=false,className='',natural=false,sizes='(max-width: 767px) 100vw, 50vw'}:{image:ImageAsset;priority?:boolean;className?:string;natural?:boolean;sizes?:string}) {
  return <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={sizes} preload={priority} className={`photo ${natural?'photo-natural':''} ${className}`} style={{objectPosition:image.position||'50% 50%',objectFit:!natural?image.fit||'cover':undefined}} />;
}
