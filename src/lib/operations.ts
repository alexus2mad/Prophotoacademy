import type {Acquisition} from './attribution';
import {z} from 'zod';
import {timingSafeEqual} from 'node:crypto';
import {database,hash,type Order} from './ledger';
import {HttpError} from './http';
import {acquisitionSchema} from './acquisition-schema';
import type {AcademyContent} from './types';
import {siteHref} from './ecosystem';
export function authorizeOperations(request:Request,variable='OPERATIONS_TOKEN'){
 const secret=process.env[variable];if(!secret||secret.length<32)throw new HttpError(503,'Доступ команди ще не налаштовано.');
 const token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(Buffer.byteLength(token)!==Buffer.byteLength(secret)||!timingSafeEqual(Buffer.from(token),Buffer.from(secret)))throw new HttpError(401,'Потрібен доступ команди.');
}
export const activitySchema=z.object({id:z.string().min(3).max(120),source:z.enum(['plainstack','academy','operations']),kind:z.enum(['course-enrollment','course-completed','practice-purchased','practice-completed','studio-booking']),updatedAt:z.iso.datetime(),occurredAt:z.iso.datetime(),status:z.enum(['completed','canceled','refunded']),customer:z.object({name:z.string().min(2).max(80),email:z.email().max(160).optional(),phone:z.string().regex(/^\+?[\d ()-]{9,24}$/).optional()}).strict().refine(c=>!!c.email||!!c.phone),productTitle:z.string().max(180).optional(),programId:z.string().max(100).optional(),roomId:z.string().max(100).optional(),practiceSessionId:z.string().max(100).optional(),locality:z.enum(['kyiv','other']).optional(),revenue:z.number().int().nonnegative().optional(),cost:z.number().int().nonnegative().optional(),acquisition:acquisitionSchema.optional()}).strict();
export type CustomerActivity=z.infer<typeof activitySchema>;
function activityDatabase(){const db=database();db.exec('CREATE TABLE IF NOT EXISTS customer_activity(id TEXT PRIMARY KEY, data TEXT NOT NULL)');return db;}
export function recordActivity(input:CustomerActivity){
 const db=activityDatabase();const id=input.source+':'+input.id;db.exec('BEGIN IMMEDIATE');
 try{const old=db.prepare('SELECT data FROM customer_activity WHERE id=?').get(id) as {data:string}|undefined;
  if(old&&Date.parse(JSON.parse(old.data).updatedAt)>=Date.parse(input.updatedAt)){db.exec('COMMIT');return {changed:false};}
  db.prepare('INSERT INTO customer_activity(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(id,JSON.stringify(input));db.exec('COMMIT');return {changed:true};
 }catch(error){db.exec('ROLLBACK');throw error;}
}
export function normalizeContact(value:string){
 const clean=value.trim().toLowerCase();if(clean.includes('@'))return clean;
 let digits=clean.replace(/\D/g,'');if(digits.length===10&&digits.startsWith('0'))digits='38'+digits;
 return digits?'+'+digits:clean;
}
type Customer={id:string;name:string;contacts:string[];interests:string[];marketingUpdates:boolean;marketingUpdatedAt?:number;locality?:string;acquisition?:Acquisition;activity:CustomerActivity[];inquiries:number;lastSeen:string};
export function recommendNextStep(customer:Pick<Customer,'activity'|'locality'|'interests'>,content:AcademyContent){
 if(customer.locality==='other')return {label:'Онлайн-навчання',href:siteHref('academy','courses?format=online')};
 const practice=customer.activity.filter(a=>a.kind==='practice-completed'&&a.status==='completed').sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt))[0];
 if(practice){const session=content.practiceSessions.find(s=>s.id===practice.practiceSessionId);const room=content.rooms.find(r=>r.id===(practice.roomId||session?.roomId));if(room)return {label:'Самостійна зйомка · '+room.title,href:siteHref('hub','booking?room='+room.bookingKey)};}
 if(customer.locality==='kyiv'){const completed=customer.activity.filter(a=>a.kind==='course-completed'&&a.status==='completed');const session=content.practiceSessions.find(s=>s.status!=='paused'&&completed.some(a=>s.programIds.includes(a.programId||'')));if(session)return {label:'Контент-практика в Hub',href:siteHref('hub',session.slug)};}
 if(customer.interests.includes('education')){const course=content.programs.find(p=>p.id===content.settings.primaryProgramId);if(course)return {label:course.shortTitle,href:siteHref('academy',course.slug)};}
 return undefined;
}
export function customerOverview(){
 const db=activityDatabase();const groups:Customer[]=[];
 function customer(name:string,contacts:string[],at:string){
  const keys=contacts.filter(Boolean).map(normalizeContact);const matched=groups.filter(item=>item.contacts.some(contact=>keys.includes(contact)));
  let item=matched[0];
  if(!item){item={id:'customer-'+hash(keys[0]).slice(0,16),name,contacts:[],interests:[],marketingUpdates:false,activity:[],inquiries:0,lastSeen:at};groups.push(item);}
  for(const duplicate of matched.slice(1)){item.contacts.push(...duplicate.contacts);item.interests.push(...duplicate.interests);item.activity.push(...duplicate.activity);item.inquiries+=duplicate.inquiries;if((duplicate.marketingUpdatedAt||0)>(item.marketingUpdatedAt||0)){item.marketingUpdates=duplicate.marketingUpdates;item.marketingUpdatedAt=duplicate.marketingUpdatedAt;}groups.splice(groups.indexOf(duplicate),1);}
  item.contacts=[...new Set([...item.contacts,...keys])];if(Date.parse(at)>Date.parse(item.lastSeen)){item.lastSeen=at;item.name=name;}
  return item;
 }
 const rows=db.prepare('SELECT data,created_at FROM inquiries ORDER BY created_at ASC').all() as {data:string;created_at:number}[];
 for(const row of rows){const data=JSON.parse(row.data);const item=customer(data.name,[data.contact],new Date(row.created_at).toISOString());item.inquiries++;item.interests.push(data.interest||'education');item.marketingUpdates=data.marketingUpdates===true;item.marketingUpdatedAt=row.created_at;item.locality=data.locality||item.locality;item.acquisition=data.acquisition||item.acquisition;}
 const orders=(db.prepare('SELECT data FROM orders').all() as {data:string}[]).map(row=>JSON.parse(row.data) as Order).filter(order=>order.mode==='wayforpay'&&['approved','refunded'].includes(order.status));
 for(const order of orders){const at=new Date(order.createdAt*1000).toISOString();const item=customer(order.customer.name,[order.customer.email,order.customer.phone],at);item.activity.push({id:order.id,source:'academy',kind:'course-enrollment',updatedAt:at,occurredAt:at,status:order.status==='approved'?'completed':'refunded',customer:order.customer,revenue:order.amount,programId:order.programId,productTitle:order.programTitle});item.interests.push('education');item.acquisition??=order.acquisition;}
 const records=(db.prepare('SELECT data FROM customer_activity').all() as {data:string}[]).map(row=>JSON.parse(row.data) as CustomerActivity);
 for(const activity of records){const item=customer(activity.customer.name,[activity.customer.email||'',activity.customer.phone||''],activity.updatedAt);const existing=item.activity.findIndex(record=>record.id===activity.id&&record.kind===activity.kind);if(existing>=0)item.activity.splice(existing,1);item.activity.push(activity);item.locality=activity.locality||item.locality;item.acquisition??=activity.acquisition;}
 const completed=groups.flatMap(customer=>customer.activity.filter(activity=>activity.status==='completed'));
 const count=(kind:CustomerActivity['kind'])=>completed.filter(activity=>activity.kind===kind).length;
 const financial=completed.filter(activity=>activity.revenue!==undefined);
 const costsComplete=financial.length>0&&financial.every(activity=>activity.cost!==undefined);
 const metrics={enrollments:count('course-enrollment'),studioBookings:count('studio-booking'),practicePurchases:count('practice-purchased'),repeatStudioCustomers:groups.filter(item=>item.activity.filter(activity=>activity.kind==='studio-booking'&&activity.status==='completed').length>1).length,practiceToStudioCustomers:groups.filter(item=>{const practice=item.activity.filter(a=>a.kind==='practice-completed'&&a.status==='completed');return practice.some(p=>item.activity.some(a=>a.kind==='studio-booking'&&a.status==='completed'&&Date.parse(a.occurredAt)>Date.parse(p.occurredAt)));}).length,revenue:financial.reduce((sum,a)=>sum+a.revenue!,0),contributionMargin:costsComplete?financial.reduce((sum,a)=>sum+a.revenue!-a.cost!,0):null};
 return {metrics,customers:groups.sort((a,b)=>b.lastSeen.localeCompare(a.lastSeen)).map(item=>({...item,interests:[...new Set(item.interests)]})),note:'Confirmed records only. Mock payments are excluded. Conversion denominators come from consented analytics; margin requires recorded costs.'};
}
