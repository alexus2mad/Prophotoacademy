import './environment';
import {readFile} from 'node:fs/promises';
import {activitySchema} from '../src/lib/operations';
const file=process.argv[2];if(!file)throw new Error('Usage: pnpm activity:import <private-json-file>');
const token=process.env.ECOSYSTEM_INGEST_TOKEN;if(!token)throw new Error('Configure ECOSYSTEM_INGEST_TOKEN first');
const payload:unknown=JSON.parse(await readFile(file,'utf8'));if(!Array.isArray(payload))throw new Error('Expected an array of confirmed provider or course records');
const records=payload.map(input=>activitySchema.parse(input));let changed=0;
for(const record of records){const response=await fetch(new URL('/api/ecosystem/activity',process.env.NEXT_PUBLIC_SITE_URL||'http://127.0.0.1:3000'),{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(record)});if(!response.ok)throw new Error('Import failed with HTTP '+response.status);if((await response.json()).changed)changed++;}
console.log('Validated '+records.length+' records; updated '+changed+'. No messages sent.');
