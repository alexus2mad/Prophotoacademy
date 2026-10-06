import type {Metadata} from 'next';
import Link from 'next/link';
import {getContent,findOffering} from '@/lib/content';
import {prioritizePrograms} from '@/lib/program-priority';
import {CourseCard} from '@/components/course-card';
import {CatalogFilters} from '@/components/catalog-filters';
import {Consultation} from '@/components/footer';
export const metadata:Metadata={title:'Усі програми',description:'Оберіть курс фотографії, комерційного контенту чи Instagram. Класи, індивідуальне та корпоративне навчання.',alternates:{canonical:'/courses'}};
export default async function Courses({searchParams}:{searchParams:Promise<{type?:string;format?:string;level?:string}>}) {
  const content=await getContent();const filters=await searchParams;
  const programs=prioritizePrograms(content.programs,content.settings.primaryProgramId).filter(p=>(!filters.type||p.category===filters.type)&&(!filters.level||p.level===filters.level||p.level==='all')&&(!filters.format||findOffering(content,p.id)?.format===filters.format||findOffering(content,p.id)?.format==='hybrid'));
  return <><div className="container"><div className="page-heading catalog-heading"><h1>Усі програми</h1><p className="lead muted">Курси, класи та індивідуальні формати навчання.</p></div><CatalogFilters {...filters} count={programs.length}/>{programs.length?<div className="course-grid">{programs.map(p=><CourseCard key={p.id} program={p} content={content}/>)}</div>:<div className="empty-state"><h2>Поки немає такого поєднання</h2><p className="muted">Спробуйте інший формат або перегляньте всі програми.</p><Link href="/courses" className="button">Скинути фільтри</Link></div>}</div><Consultation/></>;
}

