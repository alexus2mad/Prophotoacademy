'use client';
import {getAcquisition} from '@/lib/attribution';
import {useEffect,useRef,useState} from 'react';
import {Check,X} from 'lucide-react';
import {siteHref} from '@/lib/ecosystem';
import {FormField} from './form-field';
type InquiryContext={programId?:string;offeringId?:string;packageId?:string;practiceSessionId?:string;title?:string};
export function InquiryButton({children='Допоможіть обрати',programId,offeringId,packageId,practiceSessionId,title,className='button button-secondary'}:{children?:React.ReactNode;programId?:string;offeringId?:string;packageId?:string;practiceSessionId?:string;title?:string;className?:string}) {
  return <button className={className} onClick={()=>window.dispatchEvent(new CustomEvent('academy:inquiry',{detail:{programId,offeringId,packageId,practiceSessionId,title}}))}>{children}</button>;
}
export function InquiryDialog({site='academy',privacyUrl='/privacy-policy'}:{site?:'academy'|'hub';privacyUrl?:string}) {
  const review=process.env.NEXT_PUBLIC_REVIEW_MODE==='pages';
  const dialog=useRef<HTMLDialogElement>(null);
  const [context,setContext]=useState<InquiryContext>({});
  const [state,setState]=useState<'idle'|'sending'|'success'|'error'>('idle');
  const [error,setError]=useState('');
  const [localCapture,setLocalCapture]=useState(false);
  const [fieldErrors,setFieldErrors]=useState<Record<string,string>>({});
  useEffect(()=>{
    const open=(event:Event)=>{setContext((event as CustomEvent<InquiryContext>).detail);setState('idle');setError('');setFieldErrors({});dialog.current?.showModal();};
    window.addEventListener('academy:inquiry',open);
    return ()=>window.removeEventListener('academy:inquiry',open);
  },[]);
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    if(review){event.preventDefault();return;}
    event.preventDefault();setState('sending');setError('');setFieldErrors({});
    const form=event.currentTarget;const data=new FormData(form);
    try {
      const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('name'),contact:data.get('contact'),message:data.get('message'),website:data.get('website'),consent:data.get('consent')==='on',programId:context.programId,offeringId:context.offeringId,packageId:context.packageId,acquisition:getAcquisition(site),marketingUpdates:data.get('marketingUpdates')==='on',practiceSessionId:context.practiceSessionId,site,locality:context.practiceSessionId?'kyiv':undefined})});
      const result=await response.json();
      if(!response.ok){const fields=result.fieldErrors||{};setFieldErrors(fields);const name=Object.keys(fields)[0];if(name)(form.elements.namedItem(name) as HTMLElement|null)?.focus();throw new Error(result.error||'Не вдалося надіслати заявку.');}
      setLocalCapture(result.mode==='local');setState('success');
    } catch(error) {setError(error instanceof Error?error.message:'Спробуйте ще раз.');setState('error');}
  }
  return <dialog ref={dialog} className="dialog inquiry-dialog" aria-labelledby="inquiry-title" onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}>
    <button className="icon-button dialog-close" aria-label="Закрити" onClick={()=>dialog.current?.close()}><X size={22}/></button>
    {state==='success'?<div className="success-state" role="status"><Check size={32}/><h2 id="inquiry-title">{localCapture?'Заявку збережено':'Заявку отримано'}</h2><p>{localCapture?'Демонстраційний режим. Заявку збережено локально; команді ProPhoto вона ще не надсилається.':'Команда ProPhoto зв’яжеться з вами за вказаним контактом.'}</p><button className="button" onClick={()=>dialog.current?.close()}>Готово</button></div>:<>
      <h2 id="inquiry-title">{context.title||'Знайдемо вашу програму'}</h2>
      {review&&<p className="mock-notice" role="note">Форма показана для огляду. Заявки не надсилаються й дані не зберігаються.</p>}
      <p className="muted">{context.practiceSessionId?'Залиште контакт. Повідомимо про формат, дату й вартість, коли підтвердимо деталі практики.':'Залиште контакт. Допоможемо з форматом, пакетом і найближчим набором.'}</p>
      {context.practiceSessionId&&<p className="practice-online-alternative">Навчаєтеся поза Києвом? <a href={siteHref('academy','courses?format=online')}>Переглянути онлайн-навчання</a></p>}<form onSubmit={submit} className="form-stack">
        <FormField id="inquiry-name" label="Ваше ім’я" name="name" autoComplete="name" required minLength={2} maxLength={80} error={fieldErrors.name}/>
        <FormField id="inquiry-contact" label="Телефон або email" name="contact" autoComplete="email" required maxLength={160} placeholder="+380 або ваш email" error={fieldErrors.contact}/>
        <label htmlFor="inquiry-message">{context.practiceSessionId?'Який контент хочете створити?':'Що хочете навчитися знімати?'} <span className="muted">Необов’язково</span><textarea id="inquiry-message" name="message" rows={3} maxLength={2000} aria-invalid={fieldErrors.message?true:undefined} aria-describedby={fieldErrors.message?'inquiry-message-error':undefined}/></label>
        {fieldErrors.message&&<p id="inquiry-message-error" className="form-error">{fieldErrors.message}</p>}
        <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
        <label className="checkbox-label"><input type="checkbox" name="consent" required aria-invalid={fieldErrors.consent?true:undefined} aria-describedby={fieldErrors.consent?'inquiry-consent-error':undefined}/> <span>Погоджуюся з <a href={privacyUrl}>політикою конфіденційності</a>.</span></label>
        <label className="checkbox-label"><input name="marketingUpdates" type="checkbox"/><span>Хочу отримувати анонси навчання та практики ProPhoto</span></label>
        {fieldErrors.consent&&<p id="inquiry-consent-error" className="form-error">{fieldErrors.consent}</p>}
        {error&&!Object.keys(fieldErrors).length&&<p className="form-error" role="alert">{error}</p>}
        <button className="button" disabled={state==='sending'||review}>{review?'Недоступно в огляді':state==='sending'?'Надсилаємо…':'Надіслати заявку'}</button>
      </form>
    </>}
  </dialog>;
}
