import type {Metadata} from 'next';
import Link from 'next/link';
import {getContent,findImage} from '@/lib/content';
import {canonicalUrl,siteHref} from '@/lib/ecosystem';
import {money} from '@/lib/format';
import {Photo} from '@/components/photo';
import {PracticePreview} from '@/components/practice-preview';
export const metadata:Metadata={alternates:{canonical:canonicalUrl('hub')}};
export default async function HubHome(){
 const content=await getContent();const {hub}=content;
 return <><section className="hub-opening container"><div className="hub-opening-copy"><p className="eyebrow">Фотостудія · Київ</p><h1>{hub.heroTitle}</h1><p className="lead">{hub.heroDescription}</p><div className="hub-opening-rates" aria-label="Простори та базові тарифи">{content.rooms.map(room=><Link key={room.id} href={siteHref('hub',`booking?room=${room.bookingKey}`)}><span>{room.title}</span><span>{money(room.pricePerHour)} <small>/ год</small></span></Link>)}</div><div className="hub-location"><a href={hub.mapsUrl} target="_blank" rel="noreferrer">{hub.address}</a><span>{hub.hours}</span></div><Link href={siteHref('hub','booking')} className="button">Перевірити вільний час</Link></div><figure className="hub-opening-photo"><Photo image={findImage(content,hub.heroImageId)} priority/></figure></section>
 <section className="container hub-spaces" id="spaces" aria-labelledby="spaces-title"><div className="section-heading"><h2 id="spaces-title">Оберіть свій простір</h2><p className="muted">Базові тарифи · фінальна вартість у календарі</p></div><div className="room-grid">{content.rooms.map(room=><article className="room-card" key={room.id}><Link href={siteHref('hub',room.slug)} className="room-photo" aria-label={`Переглянути ${room.title}`}><Photo image={findImage(content,room.imageId)} sizes="(max-width:767px) 100vw,33vw"/></Link><div className="room-heading"><Link href={siteHref('hub',room.slug)}><h3>{room.title}</h3></Link><span>{money(room.pricePerHour)}<small> / год</small></span></div><p>{room.area?`${room.area} м² · `:''}{room.features.slice(0,2).join(' · ')}</p><Link href={siteHref('hub',`booking?room=${room.bookingKey}`)} className="button button-secondary button-small">Обрати час</Link></article>)}</div></section>
 <div className="container editorial-section"><PracticePreview content={content}/></div>
 <section className="container hub-arrival editorial-section"><div><h2>Зустрінемось у центрі Києва</h2><p>{hub.address}<br/>{hub.arrival}</p><a href={hub.mapsUrl} target="_blank" rel="noreferrer" className="text-link">Прокласти маршрут</a></div><div><h3>Ваша зйомка — ваш простір</h3><p>Оберіть залу для свого формату. Актуальну комплектацію, додаткове обладнання та готовність залів підтвердить команда студії.</p><a href={`tel:${hub.phone}`} className="text-link">Поговорити про зйомку</a></div></section></>;
}
