import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const academy = 'http://127.0.0.1:3200';
const booking = 'http://127.0.0.1:3201';
const directory = new URL('../../.data/learning-sandbox/', import.meta.url);
const checks = [];
async function request(origin, route, { cookie = '', value, status = 200 } = {}) {
  const response = await fetch(origin + route, {
    method: value ? 'POST' : 'GET',
    redirect: 'manual',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      'X-Studio-Client': 'booking-v1',
      Cookie: cookie,
    },
    ...(value ? { body: JSON.stringify(value) } : {}),
  });
  assert.equal(response.status, status, route + ': ' + (await response.clone().text()));
  return response;
}
async function login(origin, email) {
  const prefix = origin === academy ? '/api/auth' : '/api/academy';
  await request(origin, prefix + '/send', { value: { email } });
  const response = await request(origin, prefix + '/verify', { value: { email, code: '123456' } });
  return response.headers
    .getSetCookie()
    .map((item) => item.split(';')[0])
    .join('; ');
}
function pass(name) {
  checks.push(name);
}
const docs = Object.values(
  JSON.parse(await readFile(new URL('documents.json', directory), 'utf8')),
);
const course = docs.find(
  (doc) => doc._type === 'learningCourse' && doc.programId === 'program-sandbox-content-lab',
);
assert.ok(course, 'Create the multi-lesson course in the browser first');
const lessons = course.modules.flatMap((module) => module.lessons);
assert.equal(lessons.length, 4);
const pdfLesson = lessons.find((lesson) => lesson.blocks.some((block) => block.kind === 'pdf'));
const pdf = pdfLesson.blocks.find((block) => block.kind === 'pdf');
const mediaRoute = `/api/learning/${course.id}/${pdfLesson.id}/media/${pdf.mediaId}`;
await request(academy, mediaRoute, { status: 401 });
pass('Anonymous protected media denied');
const guest = await login(academy, 'guest@example.test');
await request(academy, mediaRoute, { cookie: guest, status: 403 });
await request(academy, '/api/admin/courses/' + course.id, { cookie: guest, status: 403 });
pass('Unenrolled account cannot read media or course drafts');
const student = await login(academy, 'student@example.test');
const mediaResponse = await request(academy, mediaRoute, { cookie: student });
assert.match(mediaResponse.headers.get('cache-control') || '', /no-store/);
const media = await mediaResponse.json();
assert.equal(new URL(media.url).origin, 'http://127.0.0.1:3202');
assert.equal((await fetch(media.url)).status, 200);
pass('Enrolled student receives a working temporary PDF URL without shared caching');
await request(academy, '/api/admin/courses/' + course.id, { cookie: student, status: 403 });
pass('Enrolled student cannot author courses');
for (const endpoint of ['/api/checkout', '/api/payments/mock', '/api/payments/wayforpay/callback'])
  await request(academy, endpoint, { value: {}, status: 503 });
pass('Checkout, mock payments, and real payment callbacks remain disabled');
const manager = await login(booking, 'manager@example.test');
const person = await (
  await request(booking, '/api/academy/person?email=student%40example.test', { cookie: manager })
).json();
const grants = person.grants.filter((grant) => grant.course_id === course.id);
assert.equal(grants.length, 1);
assert.equal(grants[0].lesson_ids.length, 4);
assert.equal(grants[0].revoked_at, null);
assert.equal(person.purchases.length, 0);
const progress = person.progress.filter((row) => row.course_id === course.id);
assert.equal(progress.length, 4);
assert.ok(progress.every((row) => row.completed_at));
assert.equal(progress.find((row) => row.lesson_id === lessons[3].id).completion_source, 'admin');
pass(
  'One restored grant retains four completed lessons; Zoom completion is administrator-confirmed',
);
pass('Test access creates no purchases');
const overview = await (
  await request(booking, '/api/academy/overview', { cookie: manager })
).json();
const sessions = overview.sessions.filter((session) => session.course_id === course.id);
assert.equal(sessions.length, 2);
assert.equal(
  sessions.filter((session) => session.title === 'Завершений тестовий розбір').length,
  1,
);
pass('Repeated meeting save leaves one past session and one upcoming session');
const meeting = sessions.find((session) => session.title === 'Тестовий розбір контенту');
assert.equal(meeting.starts_at, '2026-10-11T15:00:00.000Z');
const calendar = await request(
  academy,
  `/api/learning/${course.id}/${meeting.lesson_id}/calendar?session=${meeting.id}`,
  { cookie: student },
);
assert.match(await calendar.text(), /BEGIN:VCALENDAR/);
pass('Kyiv schedule maps to the correct UTC instant and exports a calendar event');
await mkdir(new URL('multi-lesson/', directory), { recursive: true });
await writeFile(
  new URL('multi-lesson/verification.json', directory),
  JSON.stringify({ checkedAt: new Date().toISOString(), courseId: course.id, checks }, null, 2),
);
console.log(checks.map((name) => 'PASS ' + name).join('\n'));
