import Link from 'next/link';
import {Check} from 'lucide-react';
import type {AcademyContent,Program} from '@/lib/types';
import {findImage,findOffering} from '@/lib/content';
import {canEnroll,dateLabel,formatLabel,money,offeringStatus,startingPrice} from '@/lib/format';
import {Photo} from './photo';
import {InquiryButton} from './inquiry';
import {Gallery} from './gallery';

import {MobileEnrollment} from './mobile-enrollment';
import {PracticePreview} from './practice-preview';
import {ProgramPackages} from './program-packages';
export function ProgramPage({program,content}:{program:Program;content:AcademyContent}) {
  const offering=findOffering(content,program.id);const price=startingPrice(offering);
  const open=offering&&canEnroll(offering);const isCustom=['individual','corporate'].includes(program.category);
  const status=offering?offeringStatus(offering):'waitlist';
  const inquiryTitle=isCustom?program.title:status==='archived'?'Повідомити про наступну подію':'Дізнатися про найближчий набір';
  const buttonLabel=isCustom?'Обговорити програму':status==='archived'?'Наступна подія':offering?.startDate&&offering.startDate>=new Date().toISOString().slice(0,10)?'Уточнити набір':'Дізнатися про набір';
  const enrollmentAction=open?<a href="#packages" className="button button-wide">Обрати пакет</a>:<InquiryButton programId={program.id} title={inquiryTitle} className="button button-wide">{buttonLabel}</InquiryButton>;
  return <><div className="container program-landing"><section className="program-hero"><div><nav className="breadcrumb" aria-label="Шлях до сторінки"><Link href="/courses">Усі програми</Link></nav><h1>{program.shortTitle}</h1><p className="lead">{program.description}</p>{price!==undefined&&<p className="program-hero-price"><strong>від {money(price)}</strong></p>}<div className="program-facts"><div><span>Формат</span>{offering?formatLabel[offering.format]:'За запитом'}</div>{!isCustom&&offering?.duration&&<div><span>Тривалість</span>{offering.duration}</div>}<div><span>{isCustom?'Початок':status==='archived'?'Відбулася':offering?.startDate&&offering.startDate>=new Date().toISOString().slice(0,10)?'Дата на сторінці курсу':'Найближчий старт'}</span>{isCustom?'Узгодимо з вами':status==='archived'?dateLabel(offering?.startDate):open?dateLabel(offering?.startDate):offering?.startDate&&offering.startDate>=new Date().toISOString().slice(0,10)?dateLabel(offering.startDate):'Уточнюємо набір'}</div></div><div className="program-hero-actions">{open?<a href="#packages" className="button">Обрати пакет</a>:<InquiryButton programId={program.id} title={inquiryTitle} className="button">{buttonLabel}</InquiryButton>}{!offering?.packages.length&&<a href="#program-overview" className="text-link">Деталі програми</a>}</div></div><figure className="program-hero-photo"><Photo image={findImage(content,program.imageId)} priority/><figcaption>{findImage(content,program.imageId).credit}</figcaption></figure></section>
    {!!offering?.packages.length&&<ProgramPackages offering={offering} program={program}/>}
    <div className="program-layout" id="program-overview"><div className="program-content"><section><h2>Чого ви навчитеся</h2><ul className="outcomes">{program.outcomes.map((outcome,i)=><li key={outcome}><span className="outcome-number">0{i+1}</span><span className="outcome-copy">{outcome}</span></li>)}</ul></section><section><h2>Для кого ця програма</h2><ul className="audience-list">{program.audience.map(a=><li key={a}><Check/>{a}</li>)}</ul></section>
    {!!program.modules.length&&<section><h2>Що будемо вивчати</h2>{program.modules.map((module,i)=><details key={module.title} open={i===0}><summary>{module.title}</summary><ul>{module.topics.map(topic=><li key={topic}>{topic}</li>)}</ul></details>)}</section>}
    <PracticePreview content={content} programId={program.id} compact/>
    <section id="instructors"><h2>Ваші викладачі</h2><div className="instructors-grid">{content.instructors.filter(i=>program.instructorIds.includes(i.id)).map(instructor=><article className="instructor-card" key={instructor.id}><div className="instructor-photo"><Photo image={findImage(content,instructor.imageId)}/></div><h3>{instructor.name}</h3><p>{instructor.role}</p><p>{instructor.bio}</p></article>)}</div></section>
    {!!program.workIds.length&&<section><h2>Роботи студентів</h2><Gallery works={content.works.filter(w=>program.workIds.includes(w.id))} images={content.images}/></section>}
    {!!program.faqs.length&&<section><h2>Відповіді перед стартом</h2>{program.faqs.map(faq=><details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>}
    </div><aside className="enrollment-panel" aria-label="Запис на навчання"><h3>{program.shortTitle}</h3>{price!==undefined&&<div className="price"><span className="muted">від </span>{money(price)}</div>}{enrollmentAction}{!open&&!!offering?.packages.length&&<a href="#packages" className="panel-link">Пакети й вартість</a>}</aside></div>
    </div><MobileEnrollment price={price}>{open?<a href="#packages" className="button">Обрати пакет</a>:<InquiryButton programId={program.id} title={inquiryTitle} className="button">{buttonLabel}</InquiryButton>}</MobileEnrollment></>;}



