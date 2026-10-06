'use client';
import {useRef,useState} from 'react';

import {FormField} from './form-field';
export function CheckoutForm({offeringId,packageId,mock}:{offeringId:string;packageId:string;mock:boolean}) {
 const [state,setState]=useState<'idle'|'sending'|'error'>('idle');const [error,setError]=useState('');
 const [fieldErrors,setFieldErrors]=useState<Record<string,string>>({});
 const identity=useRef<{token:string;key:string}|null>(null);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setState('sending');setError('');setFieldErrors({});const formElement=event.currentTarget;
  if(!identity.current){const bytes=crypto.getRandomValues(new Uint8Array(32));identity.current={token:Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join(''),key:crypto.randomUUID()};}
  const data=new FormData(event.currentTarget);
  try{const response=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offeringId,packageId,name:data.get('name'),email:data.get('email'),phone:data.get('phone'),consent:data.get('consent')==='on',token:identity.current.token,idempotencyKey:identity.current.key})});const result=await response.json();if(!response.ok){const fields=result.fieldErrors||{};setFieldErrors(fields);const name=Object.keys(fields)[0];if(name)(formElement.elements.namedItem(name) as HTMLElement|null)?.focus();throw new Error(result.error||'Не вдалося оформити замовлення.');}
   if(result.mode==='mock'){window.location.assign(result.url);return;}
   const form=document.createElement('form');form.method='POST';form.action=result.action;
   Object.entries(result.fields).forEach(([name,value])=>{const values=Array.isArray(value)?value:[value];values.forEach(v=>{const input=document.createElement('input');input.type='hidden';input.name=Array.isArray(value)?`${name}[]`:name;input.value=String(v);form.appendChild(input);});});document.body.appendChild(form);form.submit();
  }catch(error){setState('error');setError(error instanceof Error?error.message:'Спробуйте ще раз.');}
 }
 return <form className="form-stack" onSubmit={submit}>
  <FormField id="checkout-name" label="Ваше ім’я" name="name" autoComplete="name" required minLength={2} maxLength={80} error={fieldErrors.name}/>
  <FormField id="checkout-email" label="Email для доступу до навчання" name="email" type="email" autoComplete="email" required maxLength={160} error={fieldErrors.email}/>
  <FormField id="checkout-phone" label="Телефон" name="phone" type="tel" autoComplete="tel" required pattern="\+?[0-9\s\(\)\-]{9,24}" placeholder="+380" error={fieldErrors.phone}/>
  <label className="checkbox-label"><input name="consent" type="checkbox" required aria-invalid={fieldErrors.consent?true:undefined} aria-describedby={fieldErrors.consent?'checkout-consent-error':undefined}/><span>Погоджуюся з <a href="/terms-of-service" target="_blank">публічною офертою</a> та <a href="/privacy-policy" target="_blank">політикою конфіденційності</a>.</span></label>
  {fieldErrors.consent&&<p id="checkout-consent-error" className="form-error">{fieldErrors.consent}</p>}
  {error&&!Object.keys(fieldErrors).length&&<p className="form-error" role="alert">{error}</p>}
  <button className="button button-wide" disabled={state==='sending'}>{state==='sending'?'Готуємо замовлення…':mock?'Перевірити оформлення':'Перейти до оплати'}</button>
  {mock&&<p className="mock-notice">Демонстраційний режим. Гроші не списуються. Дані зберігаються лише локально для перевірки оформлення.</p>}
 </form>;
}
