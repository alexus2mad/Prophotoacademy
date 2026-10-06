'use client';
import {useState} from 'react';
import Link from 'next/link';
import {SlidersHorizontal} from 'lucide-react';
export function CatalogFilters({type='',format='',level='',count}:{type?:string;format?:string;level?:string;count:number}) {
  const [expanded,setExpanded]=useState(Boolean(format||level));
  const submit=(event:React.ChangeEvent<HTMLSelectElement>)=>event.currentTarget.form?.requestSubmit();
  return <form className="filters" action="/courses">
    <label className="type-filter">Тип програми<select name="type" defaultValue={type} onChange={submit}><option value="">Усі програми</option><option value="course">Курси</option><option value="class">Класи та події</option><option value="individual">Індивідуально</option><option value="corporate">Для команди</option></select></label>
    <div className="secondary-filters" id="catalog-secondary-filters" data-expanded={expanded}><label>Формат<select name="format" defaultValue={format} onChange={submit}><option value="">Будь-який</option><option value="online">Онлайн</option><option value="offline">У Києві</option><option value="hybrid">Онлайн + Київ</option></select></label><label>Ваш досвід<select name="level" defaultValue={level} onChange={submit}><option value="">Будь-який</option><option value="beginner">Починаю</option><option value="intermediate">Уже знімаю</option><option value="all">Для всіх</option></select></label></div>
    <div className="filter-actions"><button type="button" className="text-link filters-toggle" aria-expanded={expanded} aria-controls="catalog-secondary-filters" onClick={()=>setExpanded(value=>!value)}><SlidersHorizontal size={16}/>Фільтри{(format||level)&&<span aria-label="Є активні фільтри"> · {[format,level].filter(Boolean).length}</span>}</button><p className="filter-count" role="status">Програм: {count}</p>{(type||format||level)&&<Link href="/courses" className="text-link filter-reset">Очистити</Link>}</div>
    <noscript><style>{'.secondary-filters{display:flex!important;}'}</style><button className="button button-secondary">Застосувати</button></noscript>
  </form>;
}

