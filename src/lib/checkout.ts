import {z} from 'zod';
import type {AcademyContent,Offering,Package,Program} from './types';
import {canEnroll} from './format';
import {HttpError} from './http';
export const checkoutInput=z.object({offeringId:z.string().min(1).max(100),packageId:z.string().min(1).max(100),name:z.string().trim().min(2).max(80),email:z.email().max(160),phone:z.string().trim().regex(/^\+?[\d\s()-]{9,24}$/),consent:z.literal(true),token:z.string().regex(/^[a-f0-9]{64}$/),idempotencyKey:z.uuid()}).strict();
const demoProgram={id:'demo-program',title:'Демонстрація оформлення',shortTitle:'Демонстрація оформлення',imageId:'visual'} as Program;
const demoPackage:Package={id:'demo-base',name:'BASE · демо',price:9600,availability:'open',description:'Лише перевірка локального процесу',includes:[]};
const demoOffering:Offering={id:'demo-offering',programId:'demo-program',duration:'Демонстрація',format:'online',availability:'open',verificationRequired:false,packages:[demoPackage]};
export function resolvePurchase(content:AcademyContent,offeringId:string,packageId:string,now=new Date()) {
 if(offeringId==='demo-offering'&&packageId==='demo-base'&&(process.env.PAYMENT_MODE||'mock')==='mock')return {program:demoProgram,offering:demoOffering,pack:demoPackage};
 const offering=content.offerings.find(o=>o.id===offeringId);const pack=offering?.packages.find(p=>p.id===packageId);const program=content.programs.find(p=>p.id===offering?.programId);
 if(!offering||!pack||!program)throw new HttpError(404,'Пакет не знайдено.');
 if(!canEnroll(offering,pack,now))throw new HttpError(409,'Набір у цей пакет не підтверджено. Залиште заявку академії.');
 return {program,offering,pack};
}
