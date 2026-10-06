import Link from 'next/link';

import {getContent,findImage,findOffering} from '@/lib/content';
import {primaryProgram} from '@/lib/program-priority';
import {formatLabel} from '@/lib/format';
import {CoursePreview} from '@/components/course-preview';
import {Photo} from '@/components/photo';
import {Gallery} from '@/components/gallery';
import {InquiryButton} from '@/components/inquiry';
import {Consultation} from '@/components/footer';
import {PracticePreview} from '@/components/practice-preview';
import {EditorialMotion} from '@/components/reveal';

export default async function Home() {
  const content=await getContent();
  const primary=primaryProgram(content);
  const offering=primary?findOffering(content,primary.id):undefined;
  const heroImage=findImage(content,primary?.imageId||content.settings.heroImageId);
  const courses=content.programs.filter(p=>p.featured&&p.category==='course'&&p.id!==primary?.id).slice(0,3);
  const quotes=content.testimonials.filter(t=>t.kind==='quote'&&t.quote&&t.quote.length<700);
  const courseQuotes=primary?quotes.filter(t=>t.programId===primary.id):[];
  const testimonials=(courseQuotes.length?courseQuotes:quotes).slice(0,2);
  return <>
    <EditorialMotion/>
    <section className={`exhibition-hero container ${primary?'exhibition-hero--primary':''}`} aria-labelledby="hero-title">
      <Photo image={heroImage} priority className="exhibition-image" sizes={primary?'(max-width: 767px) 100vw, 55vw':'(max-width: 767px) 100vw, 80vw'}/>
      <div className="exhibition-scrim" aria-hidden="true"/>
      <div className="exhibition-copy"><p className="eyebrow">{primary?'Курс Pro Photo Academy':'Академія фотографії та візуального контенту'}</p><h1 id="hero-title">{primary?.shortTitle||content.settings.heroTitle}</h1><p className="exhibition-description">{primary?(primary.homepageDescription||primary.description):content.settings.heroDescription}</p>{primary&&offering&&<p className="exhibition-facts">{formatLabel[offering.format]}{offering.duration&&<> · {offering.duration}</>}</p>}{primary?<Link href={`/${primary.slug}`} className="button">Переглянути курс</Link>:<a href="#courses" className="button">Знайти свій курс</a>}</div>
      <div className="exhibition-label"><span>{heroImage.credit}</span></div>
    </section>
    <section className="course-selection container" id="courses" aria-labelledby="selection-title"><div className="selection-heading"><h2 id="selection-title">{primary?'Інші програми':'Наші курси'}</h2><Link href="/courses" className="text-link">Усі програми</Link></div><div className={`preview-grid ${primary&&courses.length===2?'preview-grid--secondary':''}`}>{courses.map(p=><CoursePreview key={p.id} program={p} content={content}/>)}</div><div className="other-programs"><Link href="/courses?type=class">Класи та події</Link><Link href="/individual-training">Індивідуально</Link><Link href="/corporate-training">Для команд</Link></div></section>
    <section className="editorial-section student-exhibition container" data-editorial-reveal><div className="section-heading"><div><h2>Роботи студентів</h2></div><div className="section-side"><Link href="/student-work" className="text-link">Усі роботи студентів</Link></div></div><Gallery works={content.works} images={content.images}/></section>
    <section className="editorial-section learning-editorial container" data-editorial-reveal><figure className="learning-photo"><Photo image={findImage(content,'practice')}/></figure><div className="learning-copy"><h2>Як ми навчаємо</h2><ol className="learning-steps"><li><span>01</span><div><h3>Зрозуміти</h3><p>Світло, композицію та інструменти. Те, що допомагає створювати кадр свідомо.</p></div></li><li><span>02</span><div><h3>Спробувати</h3><p>Відпрацювати техніку на власних фото й відео. Обрати пакет із практикою та підтримкою.</p></div></li><li><span>03</span><div><h3>Створювати своє</h3><p>Знайти візуальну мову для особистих проєктів, контенту чи роботи з брендами.</p></div></li></ol></div></section>
    <div className="container editorial-section" data-editorial-reveal><PracticePreview content={content} programId={primary?.id}/></div>
    <section className="editorial-section founder-editorial container" data-editorial-reveal><div className="founder-editorial-copy"><h2>Навчання з досвіду<br/>реальних зйомок</h2><div className="founder-biography"><h3>Олена Попова</h3><p className="founder-role">Рекламна фотографка.<br/>Засновниця Pro Photo Academy.</p><p>Понад 15 років у професії. Досвід зйомок для брендів — у навчанні, яке допомагає перейти від випадкового кадру до впевненої практики.</p><Link href="/about-us#team" className="text-link">Познайомитися з командою</Link></div><div className="founder-stat"><strong>3000+</strong><span>випускників академії</span></div></div><figure className="founder-editorial-photo"><Photo image={findImage(content,'founder')} natural/></figure></section>
    {!!testimonials.length&&<section className="editorial-section testimonials-section container" data-editorial-reveal><div className="section-heading"><div><h2>{courseQuotes.length?'Відгуки учасників курсу':'Відгуки про академію'}</h2></div><Link href="/reviews" className="text-link">Усі відгуки</Link></div><div className="testimonial-pair">{testimonials.map(t=><figure key={t.id}><blockquote>{t.quote}</blockquote><figcaption><strong>{t.name}</strong></figcaption></figure>)}</div></section>}
    <section className="editorial-section custom-editorial container" data-editorial-reveal><div className="custom-intro"><h2>Навчання під ваші цілі</h2><p>Коли готова програма не відповідає вашому запиту, створюємо навчання навколо конкретних завдань.</p></div><div className="custom-editorial-grid"><article><h3>Індивідуальне навчання</h3><p>Фото, відео або контент. Особиста програма і робота з викладачем.</p><InquiryButton programId="program-individual" title="Ваш особистий формат" className="text-link">Обговорити програму</InquiryButton></article><article><h3>Навчання для команди</h3><p>Навички фото й відео на реальних завданнях вашого бренду.</p><InquiryButton programId="program-corporate" title="Навчання для вашої команди" className="text-link">Навчити команду</InquiryButton></article></div></section>
    <Consultation/>
  </>;
}

