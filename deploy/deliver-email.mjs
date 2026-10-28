const secret = process.env.CRON_SECRET;
if (!secret) throw new Error('CRON_SECRET is required');
const port = process.argv[2] || '3140';
if (!['3140', '3141'].includes(port)) throw new Error('Unknown Academy email destination');
if (port === '3141' && process.env.NEXT_PUBLIC_ACADEMY_URL !== 'https://staging.prophotoacademy.com.ua')
  throw new Error('Staging email worker requires the isolated staging environment');
const response = await fetch(`http://127.0.0.1:${port}/api/cron/platform`, {
  headers: { Authorization: 'Bearer ' + secret },
  redirect: 'error',
  signal: AbortSignal.timeout(280_000),
});
if (!response.ok) throw new Error('Academy email job failed: HTTP ' + response.status);
console.log('Academy email job completed');
