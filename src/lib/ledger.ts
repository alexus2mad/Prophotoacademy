import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import type {Acquisition} from './attribution';
export type OrderStatus='pending'|'approved'|'declined'|'canceled'|'refunded';
export type Order={id:string;tokenHash:string;idempotencyKey:string;fingerprint:string;offeringId:string;packageId:string;programId?:string;programTitle:string;packageName:string;amount:number;currency:string;customer:{name:string;email:string;phone:string};status:OrderStatus;mode:'mock'|'wayforpay';createdAt:number;acquisition?:Acquisition};
const globalLedger=globalThis as unknown as {academyDatabases?:Map<string,DatabaseSync>};
export function database(){
 const file=process.env.DATABASE_PATH||path.join(process.cwd(),'.data','academy.sqlite');
 globalLedger.academyDatabases??=new Map();const existing=globalLedger.academyDatabases.get(file);if(existing)return existing;
 mkdirSync(path.dirname(file),{recursive:true});const db=new DatabaseSync(file);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 db.exec(`CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, idempotency_key TEXT NOT NULL UNIQUE, fingerprint TEXT NOT NULL, data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS inquiries(id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY, kind TEXT NOT NULL, data TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, next_attempt INTEGER NOT NULL, state TEXT NOT NULL DEFAULT 'pending', last_error TEXT);
 CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);`);
 const columns=(db.prepare('PRAGMA table_info(outbox)').all() as {name:string}[]).map(column=>column.name);
 if(!columns.includes('claim_until'))db.exec('ALTER TABLE outbox ADD COLUMN claim_until INTEGER NOT NULL DEFAULT 0');
 if(!columns.includes('claim_token'))db.exec('ALTER TABLE outbox ADD COLUMN claim_token TEXT');
 globalLedger.academyDatabases.set(file,db);return db;
}
export const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
export function orderById(id:string):Order|undefined{const row=database().prepare('SELECT data FROM orders WHERE id=?').get(id) as {data:string}|undefined;return row?JSON.parse(row.data):undefined;}
export function orderByToken(token:string):Order|undefined{const row=database().prepare('SELECT data FROM orders WHERE token_hash=?').get(hash(token)) as {data:string}|undefined;return row?JSON.parse(row.data):undefined;}
export function orderByKey(key:string):Order|undefined{const row=database().prepare('SELECT data FROM orders WHERE idempotency_key=?').get(key) as {data:string}|undefined;return row?JSON.parse(row.data):undefined;}
export class IdempotencyConflict extends Error {}
export function createOrder(data:Omit<Order,'id'|'tokenHash'|'createdAt'|'status'>,token:string){
 const db=database();db.exec('BEGIN IMMEDIATE');
 try {
  const existing=orderByKey(data.idempotencyKey);
  if(existing){if(existing.fingerprint!==data.fingerprint||existing.tokenHash!==hash(token)||existing.mode!==data.mode)throw new IdempotencyConflict('Idempotency conflict');db.exec('COMMIT');return existing;}
  const order:Order={...data,id:`ppa-${randomUUID()}`,tokenHash:hash(token),status:'pending',createdAt:Math.floor(Date.now()/1000)};
  db.prepare('INSERT INTO orders VALUES(?,?,?,?,?)').run(order.id,order.tokenHash,order.idempotencyKey,order.fingerprint,JSON.stringify(order));db.exec('COMMIT');return order;
 }catch(error){db.exec('ROLLBACK');throw error;}
}
export const createToken=()=>randomBytes(32).toString('hex');
function enqueue(id:string,kind:string,data:unknown){database().prepare('INSERT OR IGNORE INTO outbox(id,kind,data,next_attempt) VALUES(?,?,?,?)').run(id,kind,JSON.stringify(data),Date.now());}
export function updateOrder(id:string,status:OrderStatus){
 const db=database();db.exec('BEGIN IMMEDIATE');
 try{const order=orderById(id);if(!order)throw new Error('Order not found');
  const allowed=(order.status==='pending'&&status!=='refunded')||(order.status==='approved'&&status==='refunded');
  if(order.status!==status&&allowed){order.status=status;db.prepare('UPDATE orders SET data=? WHERE id=?').run(JSON.stringify(order),id);enqueue(`${id}:${status}`,'order-status',{orderId:id,status,programTitle:order.programTitle,packageName:order.packageName,amount:order.amount,currency:order.currency,customer:order.customer,mode:order.mode});}
  db.exec('COMMIT');return order;
 }catch(error){db.exec('ROLLBACK');throw error;}
}
export function saveInquiry(data:unknown){const id=randomUUID();const db=database();db.exec('BEGIN IMMEDIATE');try{db.prepare('INSERT INTO inquiries VALUES(?,?,?)').run(id,JSON.stringify(data),Date.now());enqueue(id,'inquiry',{id,...data as object});db.exec('COMMIT');return id;}catch(error){db.exec('ROLLBACK');throw error;}}
export function rateLimit(key:string,limit=20,windowMs=60_000){const db=database();const now=Date.now();db.prepare('DELETE FROM rate_limits WHERE expires<?').run(now);db.prepare('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(hash(key),now+windowMs);const result=db.prepare('SELECT count FROM rate_limits WHERE key=?').get(hash(key)) as {count:number};return result.count<=limit;}
export async function deliverOutbox(){
 const url=process.env.MAKE_WEBHOOK_URL;const db=database();const now=Date.now();
 // Mock payments and local inquiries remain captured locally unless a webhook is explicitly configured.
 if(process.env.NOTIFICATION_MODE!=='make'||!url)return {delivered:0,mode:'local-capture'};
 const endpoint=new URL(url);if(endpoint.protocol!=='https:')throw new Error('MAKE_WEBHOOK_URL must use HTTPS');
 const jobs=db.prepare("SELECT * FROM outbox WHERE state='pending' AND next_attempt<=? AND claim_until<=? ORDER BY next_attempt LIMIT 20").all(now,now) as {id:string;kind:string;data:string;attempts:number}[];
 let delivered=0;
 for(const job of jobs){
  const claim=randomUUID();const started=Date.now();
  const claimed=db.prepare("UPDATE outbox SET claim_until=?,claim_token=? WHERE id=? AND state='pending' AND claim_until<=? AND next_attempt<=?").run(started+30_000,claim,job.id,started,started);
  if(!claimed.changes)continue;
  const payload=JSON.parse(job.data);if(payload.mode==='mock'){db.prepare("UPDATE outbox SET state='local',claim_until=0,claim_token=NULL WHERE id=? AND claim_token=?").run(job.id,claim);continue;}
  try{const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':job.id},body:JSON.stringify({eventId:job.id,type:job.kind,...payload}),signal:AbortSignal.timeout(10_000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);db.prepare("UPDATE outbox SET state='delivered',last_error=NULL,claim_until=0,claim_token=NULL WHERE id=? AND claim_token=?").run(job.id,claim);delivered++;}
  catch{const attempts=job.attempts+1;db.prepare('UPDATE outbox SET attempts=?,next_attempt=?,last_error=?,claim_until=0,claim_token=NULL WHERE id=? AND claim_token=?').run(attempts,Date.now()+Math.min(3_600_000,30_000*2**Math.min(attempts,7)),'Delivery failed; retry scheduled',job.id,claim);}
 }
 return {delivered,mode:'make'};
}
