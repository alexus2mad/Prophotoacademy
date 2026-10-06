import type {Availability, Offering, Package,Program} from './types';
// Keep the currency mark identical across browser and Node ICU versions.
export const money = (amount:number) => `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')}\u00a0₴`;
export const dateLabel = (value?:string) => value ? new Intl.DateTimeFormat('uk-UA',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Kyiv'}).format(new Date(value+'T12:00:00Z')) : 'Дату узгодимо з вами';
export const formatLabel = {online:'Онлайн',offline:'У Києві',hybrid:'Онлайн + Київ'};
export const availabilityLabel:Record<Availability,string> = {open:'Набір відкрито',limited:'Місця обмежені',soldOut:'Місць немає',waitlist:'Уточнюємо набір',archived:'Подія завершена'};
export function audienceLabel(program:Program){return program.audienceLabel||{beginner:'Для початківців',intermediate:'Для роботи з брендами',all:'Для будь-якого рівня'}[program.level];}
export function programStatusLabel(program:Program,offering?:Offering){return ['individual','corporate'].includes(program.category)?'За вашим запитом':availabilityLabel[offering?offeringStatus(offering):'waitlist'];}
export function phoneLabel(phone:string){return phone.replace(/^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/,'+380 $1 $2 $3 $4');}
export function canEnroll(offering:Offering, pack?:Package, now=new Date()) {
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Kyiv',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  return offering.verificationRequired===false && ['open','limited'].includes(offering.availability) && (!offering.startDate || offering.startDate>=today) && (pack?['open','limited'].includes(pack.availability):offering.packages.some(p=>['open','limited'].includes(p.availability)));
}
export function offeringStatus(offering:Offering):Availability {
  if(offering.availability==='archived') return 'archived';
  return canEnroll(offering)?offering.availability:'waitlist';
}
export function startingPrice(offering?:Offering) {
  if(!offering?.packages.length) return undefined;
  const available=offering.packages.filter(p=>!['soldOut','archived'].includes(p.availability));
  return Math.min(...(available.length?available:offering.packages).map(p=>p.price));
}
