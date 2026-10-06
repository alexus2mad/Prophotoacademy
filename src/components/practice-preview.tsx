import Link from 'next/link';
import type {AcademyContent} from '@/lib/types';
import {findImage} from '@/lib/content';
import {siteHref,readyPractice} from '@/lib/ecosystem';
import {Photo} from './photo';
export function PracticePreview({content,programId,compact=false}:{content:AcademyContent;programId?:string;compact?:boolean}){
  const session=content.practiceSessions.find(s=>s.status!=='paused'&&(!programId||s.programIds.includes(programId)));
  if(!session)return null;
  return <section className={`practice-preview ${compact?'practice-preview--compact':''}`} aria-label="Практика в Києві"><div className="practice-preview-photo"><Photo image={findImage(content,session.imageId)}/></div><div><p className="practice-location">Офлайн · Київ</p><h2>{compact?'Від знань до власної зйомки':'Навчайтеся онлайн — практикуйтеся в Києві'}</h2><p>{session.description}</p>{!readyPractice(session)&&<p className="practice-stage">Готуємо формат · дата й вартість після підтвердження</p>}<Link href={siteHref('hub',session.slug)} className="text-link" data-ecosystem-target="hub" data-offer="guided-practice">{readyPractice(session)?'Переглянути практику':'Про практику в Hub'}</Link></div></section>;
}
