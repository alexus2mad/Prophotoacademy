'use client';
import {useState} from 'react';
export function PreviewBanner(){
 const [busy,setBusy]=useState(false);const [error,setError]=useState(false);
 async function exit(){setBusy(true);try{const response=await fetch('/api/draft/disable',{method:'POST'});if(!response.ok)throw new Error();window.location.reload();}catch{setError(true);setBusy(false);}}
 return <div className="preview-banner"><span>{error?'Не вдалося закрити попередній перегляд':'Попередній перегляд чернеток'}</span><button onClick={exit} disabled={busy}>{busy?'Закриваємо…':'Повернутися до опублікованого сайту'}</button></div>;
}
