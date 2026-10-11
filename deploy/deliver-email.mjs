const secret = process.env.CRON_SECRET;
if (!secret) throw new Error('CRON_SECRET is required');
const response = await fetch('http://127.0.0.1:3140/api/cron/platform', {
  headers: { Authorization: 'Bearer ' + secret },
  redirect: 'error',
  signal: AbortSignal.timeout(280_000),
});
if (!response.ok) throw new Error('Academy email job failed: HTTP ' + response.status);
console.log('Academy email job completed');
