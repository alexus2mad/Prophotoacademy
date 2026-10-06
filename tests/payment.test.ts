import {describe,it,expect,beforeAll} from 'vitest';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {sign,verifyCallback} from '../src/lib/wayforpay';
import {createOrder,database,updateOrder,orderByToken,deliverOutbox} from '../src/lib/ledger';
import type {Order} from '../src/lib/ledger';
const secret='test-secret-not-a-credential';const token='b'.repeat(64);
const base={id:'ppa-test',mode:'wayforpay',amount:9600,currency:'UAH'} as Order;
function callback(extra:Record<string,unknown>={}){const data={merchantAccount:'test-merchant',orderReference:'ppa-test',amount:9600,currency:'UAH',authCode:'123',cardPan:'4111****1111',transactionStatus:'Approved',reasonCode:1100,...extra};return {...data,merchantSignature:sign([data.merchantAccount,data.orderReference,data.amount,data.currency,data.authCode,data.cardPan,data.transactionStatus,data.reasonCode],secret)};}
describe('verified payments and fulfillment',()=>{
 beforeAll(()=>{process.env.DATABASE_PATH=path.resolve('.data',`test-${randomUUID()}.sqlite`);process.env.NOTIFICATION_MODE='local';});
 it('accepts a valid provider signature and matching snapshot',()=>expect(verifyCallback(callback(),base,'test-merchant',secret)).toBe('approved'));
 it('rejects forged signatures, amounts, merchants and currencies',()=>{expect(()=>verifyCallback({...callback(),merchantSignature:'0'.repeat(32)},base,'test-merchant',secret)).toThrow('Invalid signature');for(const mismatch of [{amount:1},{currency:'USD'},{merchantAccount:'other'}])expect(()=>verifyCallback(callback(mismatch),base,'test-merchant',secret)).toThrow('Order mismatch');});
 it('keeps duplicate callbacks idempotent and prevents approved-to-pending regression',async()=>{const order=createOrder({idempotencyKey:randomUUID(),fingerprint:'test',offeringId:'demo',packageId:'base',programTitle:'Test',packageName:'Base',amount:9600,currency:'UAH',customer:{name:'Test',email:'test@example.com',phone:'+380630000000'},mode:'mock'},token);updateOrder(order.id,'approved');updateOrder(order.id,'approved');updateOrder(order.id,'pending');expect(orderByToken(token)?.status).toBe('approved');expect((database().prepare('SELECT COUNT(*) AS count FROM outbox').get() as {count:number}).count).toBe(1);expect(await deliverOutbox()).toEqual({delivered:0,mode:'local-capture'});});
 it('never reveals an order through a guessed public token',()=>expect(orderByToken('0'.repeat(64))).toBeUndefined());
});
