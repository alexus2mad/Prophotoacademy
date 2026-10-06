import Link from 'next/link';
import {Check} from 'lucide-react';
import type {Offering,Program,Package} from '@/lib/types';
import {canEnroll,money} from '@/lib/format';
import {InquiryButton} from './inquiry';
import {PackageComparison} from './package-comparison';

function Includes({pack}:{pack:Package}){return <ul className="check-list">{pack.includes.map(item=><li key={item}><Check aria-hidden="true"/>{item}</li>)}</ul>;}
export function ProgramPackages({offering,program}:{offering:Offering;program:Program}){
 const open=canEnroll(offering);
 const compared=offering.packages.map(pack=>({...pack,statusLabel:pack.availability==='soldOut'?'Місць немає':canEnroll(offering,pack)?'Доступний':'Уточнюємо набір',purchaseUrl:canEnroll(offering,pack)?`/checkout?offering=${encodeURIComponent(offering.id)}&package=${encodeURIComponent(pack.id)}`:undefined,inquiryAllowed:pack.availability!=='soldOut'}));
 return <section className="program-packages" id="packages" aria-labelledby="packages-title">
  <div className="section-heading"><h2 id="packages-title">Пакети й вартість</h2>{compared.length>1&&<PackageComparison packages={compared} programId={program.id} offeringId={offering.id} programTitle={program.shortTitle}/>}</div>
  {!open&&<p className="package-source-note">Актуальну вартість і місця підтвердить команда перед записом.</p>}
  <div className="package-grid">{offering.packages.map(pack=><article key={pack.id} className="package-card" data-unavailable={pack.availability==='soldOut'}><div className="package-header"><h3>{pack.name}</h3>{pack.availability==='soldOut'&&<span className="package-status">Місць немає</span>}</div><div className="price">{money(pack.price)}{pack.previousPrice&&<span className="previous-price">{money(pack.previousPrice)}</span>}</div><p>{pack.description}</p><div className="package-includes-desktop"><Includes pack={pack}/></div>{!!pack.includes.length&&<details className="package-includes-mobile"><summary>Що входить у пакет</summary><Includes pack={pack}/></details>}<div className="package-action">{canEnroll(offering,pack)?<Link href={`/checkout?offering=${encodeURIComponent(offering.id)}&package=${encodeURIComponent(pack.id)}`} className="button button-wide">Обрати {pack.name}</Link>:pack.availability==='soldOut'?null:<InquiryButton programId={program.id} offeringId={offering.id} packageId={pack.id} title={`${program.shortTitle}: ${pack.name}`} className="button button-secondary button-wide">Уточнити пакет</InquiryButton>}</div></article>)}</div>
 </section>;
}
