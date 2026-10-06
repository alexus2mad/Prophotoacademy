import Link from 'next/link';

import type {AcademyContent,Program} from '@/lib/types';
import {findImage,findOffering} from '@/lib/content';
import {audienceLabel,formatLabel,money,startingPrice} from '@/lib/format';
import {Photo} from './photo';

export function CoursePreview({program,content}:{program:Program;content:AcademyContent}) {
  const offering=findOffering(content,program.id);
  const price=startingPrice(offering);
  return <Link href={`/${program.slug}`} className="course-preview">
    <div className="preview-photo"><Photo image={findImage(content,program.imageId)} sizes="110px"/></div>
    <div className="preview-copy"><span className="preview-audience">{audienceLabel(program)}</span><h3>{program.shortTitle}</h3><p className="preview-meta">{offering?formatLabel[offering.format]:'За запитом'} · {offering?.duration}</p><span className="preview-price">{price!==undefined?`від ${money(price)}`:'За вашим запитом'}</span></div>
    
  </Link>;
}
