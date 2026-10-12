import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const academy = 'http://127.0.0.1:3200',
  booking = 'http://127.0.0.1:3201';
const directory = new URL('../../.data/learning-sandbox/', import.meta.url);
const documents = Object.values(
  JSON.parse(await readFile(new URL('documents.json', directory), 'utf8')),
);
const course = documents.find(
  (doc) => doc._type === 'learningCourse' && doc.programId === 'program-sandbox',
);
assert.ok(course, 'Create the test course through the UI first');
const lesson = course.modules[0].lessons[0],
  media = lesson.blocks.find((block) => block.mediaId);
assert.ok(media, 'Upload the test workbook first');
const checks = [];
async function check(name, url, options, status) {
  const response = await fetch(url, { ...options, redirect: 'manual' });
  assert.equal(response.status, status, name);
  checks.push({ name, status: response.status });
  return response;
}
const post = (value) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: academy },
  body: JSON.stringify(value),
});
for (const endpoint of [
  '/api/payments/mock',
  '/api/payments/wayforpay/callback',
  '/api/cron/platform',
])
  await check('Disabled: ' + endpoint, academy + endpoint, post({}), 503);
await check('Checkout validates enrollment input', academy + '/api/checkout', post({}), 400);
await check(
  'Booking payment mutations disabled',
  booking + '/api/admin/wayforpay/sync',
  post({}),
  503,
);
const resource = `/api/learning/${course.id}/${lesson.id}/media/${media.mediaId}`;
await check('Anonymous protected media denied', academy + resource, {}, 401);
await check(
  'Request local guest code',
  academy + '/api/auth/send',
  post({ email: 'guest@example.test' }),
  200,
);
const signedIn = await check(
  'Verify synthetic guest',
  academy + '/api/auth/verify',
  post({ email: 'guest@example.test', code: '123456' }),
  200,
);
const cookie = signedIn.headers
  .getSetCookie()
  .map((value) => value.split(';')[0])
  .join('; ');
assert.ok(cookie);
await check('Wrong-user media denied', academy + resource, { headers: { Cookie: cookie } }, 403);
await check(
  'Student authoring denied',
  academy + '/api/admin/courses',
  { ...post({}), headers: { ...post({}).headers, Cookie: cookie } },
  403,
);
await writeFile(
  new URL('verification.json', directory),
  JSON.stringify({ checkedAt: new Date().toISOString(), checks }, null, 2),
);
console.log(checks);
