'use client';
import {useState} from 'react';
export function StudioBooking({providerUrl,roomKey,roomTitle,phone}:{providerUrl:string;roomKey?:string;roomTitle?:string;phone:string}){
 const [loaded,setLoaded]=useState(false);const url=new URL(providerUrl);if(roomKey)url.searchParams.set('room',roomKey);
 return <><div className="booking-top"><h1>{roomTitle?`Бронювання · ${roomTitle}`:'Сплануйте свою зйомку'}</h1><a href={url.href} className="text-link" target="_blank" rel="noreferrer">Відкрити календар окремо</a></div>{!loaded&&<p className="muted" role="status">Завантажуємо календар студії…</p>}<iframe className="studio-booking-frame" src={url.href} title="Онлайн-бронювання ProPhoto Hub" onLoad={()=>setLoaded(true)} allow="payment"/><p className="booking-support">Потрібна допомога з бронюванням? <a href={`tel:${phone}`}>Зателефонуйте команді студії</a></p></>;
}
