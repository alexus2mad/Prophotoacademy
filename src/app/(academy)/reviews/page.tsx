import type {Metadata} from 'next';
import Image from 'next/image';
import {getContent} from '@/lib/content';
import {Consultation} from '@/components/footer';
export const metadata:Metadata={title:'Відгуки студентів',alternates:{canonical:'/reviews'}};
export default async function Reviews(){const content=await getContent();return <><div className="container"><div className="page-heading"><h1>Відгуки студентів</h1></div><div className="review-grid">{content.testimonials.map(t=><article className="review-card" key={t.id}>{t.kind==='story'&&<p className="eyebrow review-kind">Історія від академії</p>}{t.quote&&(t.kind==='story'?<p className="review-story">{t.quote}</p>:<blockquote>«{t.quote}»</blockquote>)}{t.image&&<Image src={t.image} alt={`Відгук: ${t.name}`} width={800} height={1000} sizes="(max-width:767px) 88vw, 44vw"/>}<h3>{t.name}</h3><a className="text-link" href={t.sourceUrl} target="_blank" rel="noreferrer">Переглянути оригінал</a></article>)}</div></div><Consultation/></>;}
