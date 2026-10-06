import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {randomUUID} from 'node:crypto';
import {rmSync} from 'node:fs';
import path from 'node:path';
import seed from '../content/academy.json';
import {POST as checkout} from '../src/app/api/checkout/route';
import {POST as inquiry} from '../src/app/api/inquiries/route';
import {POST as mockPayment} from '../src/app/api/payments/mock/route';
import {GET as status} from '../src/app/api/orders/status/route';
import {database,saveInquiry,deliverOutbox,orderByToken} from '../src/lib/ledger';

vi.mock('@/lib/content',()=>({getContent:async()=>seed}));
const origin='http://127.0.0.1:3000';
let dbFile:string;
const input=()=>({offeringId:'demo-offering',packageId:'demo-base',name:'Local QA',email:'qa@example.com',phone:'+380630000000',consent:true,token:randomUUID().replaceAll('-','').repeat(2),idempotencyKey:randomUUID()});
const request=(route:string,body:unknown,source=origin)=>new Request(`${origin}${route}`,{method:'POST',headers:{Origin:source,'Content-Type':'application/json'},body:JSON.stringify(body)});

beforeEach(()=>{dbFile=path.resolve('.data',`flow-test-${randomUUID()}.sqlite`);process.env.DATABASE_PATH=dbFile;process.env.NEXT_PUBLIC_SITE_URL=origin;process.env.PAYMENT_MODE='mock';process.env.NOTIFICATION_MODE='local';process.env.TRUST_PROXY='0';});
afterEach(()=>{vi.unstubAllGlobals();database().close();for(const suffix of ['','-wal','-shm'])rmSync(dbFile+suffix,{force:true});});

describe('customer API flow',()=>{
 it('retains the guided practice and business context without creating an order',async()=>{
  const payload={name:'Local QA',contact:'qa@example.com',consent:true,site:'hub',practiceSessionId:'practice-content-hub',locality:'kyiv'};
  expect((await inquiry(request('/api/inquiries',payload))).status).toBe(200);
  const data=JSON.parse((database().prepare('SELECT data FROM inquiries').get() as {data:string}).data);
  expect(data.interest).toBe('guided-practice');expect(data.practiceTitle).toBe('Контент-практика в ProPhoto Hub');expect(data.site).toBe('hub');
  expect((database().prepare('SELECT COUNT(*) AS count FROM orders').get() as {count:number}).count).toBe(0);
  expect((await inquiry(request('/api/inquiries',{...payload,practiceSessionId:'invented'}))).status).toBe(400);
 });
 it('creates one price snapshot for repeated submissions and rejects changed idempotent requests',async()=>{
  const payload=input();const first=await checkout(request('/api/checkout',payload));const second=await checkout(request('/api/checkout',payload));
  expect(first.status).toBe(200);expect(await first.json()).toEqual(await second.json());
  expect(orderByToken(payload.token)?.amount).toBe(9600);
  expect((database().prepare('SELECT COUNT(*) AS count FROM orders').get() as {count:number}).count).toBe(1);
  expect((await checkout(request('/api/checkout',{...payload,name:'Changed'}))).status).toBe(409);
 });
 it('blocks cross-origin requests, invented prices, stale enrollment and missing consent',async()=>{
  expect((await checkout(request('/api/checkout',input(),'https://other.example'))).status).toBe(403);
  expect((await checkout(request('/api/checkout',{...input(),amount:1}))).status).toBe(400);
  expect((await checkout(request('/api/checkout',{...input(),offeringId:seed.offerings[0].id,packageId:seed.offerings[0].packages[0].id}))).status).toBe(409);
  expect((await checkout(request('/api/checkout',{...input(),consent:false}))).status).toBe(400);
 });
 it('keeps status private and reaches approval through the local simulation',async()=>{
  const payload=input();await checkout(request('/api/checkout',payload));
  expect((await status(new Request(`${origin}/api/orders/status?token=${'0'.repeat(64)}`))).status).toBe(404);
  expect((await mockPayment(request('/api/payments/mock',{token:payload.token,status:'approved'}))).status).toBe(200);
  const result=await (await status(new Request(`${origin}/api/orders/status?token=${payload.token}`))).json();
  expect(result.status).toBe('approved');expect(result).not.toHaveProperty('customer');expect(JSON.stringify(result)).not.toContain(payload.email);
  process.env.PAYMENT_MODE='wayforpay';expect((await mockPayment(request('/api/payments/mock',{token:payload.token,status:'approved'}))).status).toBe(404);
 });
 it('captures a validated inquiry locally and suppresses honeypot submissions',async()=>{
  const payload={name:'Local QA',contact:'qa@example.com',message:'Local test',consent:true,programId:seed.programs[0].id};
  expect((await inquiry(request('/api/inquiries',payload))).status).toBe(200);
  expect((await inquiry(request('/api/inquiries',{...payload,website:'robot'}))).status).toBe(200);
  expect((database().prepare('SELECT COUNT(*) AS count FROM inquiries').get() as {count:number}).count).toBe(1);
  expect((await inquiry(request('/api/inquiries',{...payload,contact:'bad'}))).status).toBe(400);
  expect((await inquiry(request('/api/inquiries',{...payload,programId:'invented'}))).status).toBe(400);
 });
 it('rejects malformed and oversized JSON',async()=>{
  const malformed=new Request(`${origin}/api/inquiries`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{'});
  expect((await inquiry(malformed)).status).toBe(400);
  expect((await inquiry(request('/api/inquiries',{message:'x'.repeat(9000)}))).status).toBe(413);
 });
 it('preserves the selected package in an inquiry and rejects a mismatched package',async()=>{
  const offering=seed.offerings[0];const pack=offering.packages[2];const payload={name:'Local QA',contact:'qa@example.com',consent:true,programId:offering.programId,offeringId:offering.id,packageId:pack.id};
  expect((await inquiry(request('/api/inquiries',payload))).status).toBe(200);
  const row=database().prepare('SELECT data FROM inquiries').get() as {data:string};expect(JSON.parse(row.data).packageName).toBe(pack.name);
  expect((await inquiry(request('/api/inquiries',{...payload,packageId:'wrong'}))).status).toBe(400);
 });
});

describe('durable notification delivery',()=>{
 it('leases jobs so concurrent workers send a single event',async()=>{
  const id=saveInquiry({name:'Local QA',contact:'qa@example.com'});process.env.NOTIFICATION_MODE='make';process.env.MAKE_WEBHOOK_URL='https://example.com/test-only';
  let release:(response:Response)=>void=()=>{};
  const fetchMock=vi.fn(()=>new Promise<Response>(resolve=>{release=resolve;}));vi.stubGlobal('fetch',fetchMock);
  const first=deliverOutbox();const second=await deliverOutbox();expect(second.delivered).toBe(0);expect(fetchMock).toHaveBeenCalledTimes(1);
  release(new Response('ok'));expect((await first).delivered).toBe(1);
  const job=database().prepare('SELECT state FROM outbox WHERE id=?').get(id) as {state:string};expect(job.state).toBe('delivered');
 });
 it('persists failed delivery and retries with the same event ID',async()=>{
  const id=saveInquiry({name:'Local QA',contact:'qa@example.com'});process.env.NOTIFICATION_MODE='make';process.env.MAKE_WEBHOOK_URL='https://example.com/test-only';
  const fetchMock=vi.fn().mockResolvedValueOnce(new Response('failed',{status:500})).mockResolvedValueOnce(new Response('ok'));vi.stubGlobal('fetch',fetchMock);
  expect((await deliverOutbox()).delivered).toBe(0);
  const job=database().prepare('SELECT attempts,claim_until FROM outbox WHERE id=?').get(id) as {attempts:number;claim_until:number};expect(job.attempts).toBe(1);expect(job.claim_until).toBe(0);
  database().prepare('UPDATE outbox SET next_attempt=0 WHERE id=?').run(id);expect((await deliverOutbox()).delivered).toBe(1);
  const events=fetchMock.mock.calls.map(call=>JSON.parse(call[1].body).eventId);expect(events).toEqual([id,id]);
 });
});
