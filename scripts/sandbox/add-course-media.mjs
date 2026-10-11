import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

// Local fixtures only. Course text, publication and access are managed through the UI.
const origin = 'http://127.0.0.1:3200';
const root = new URL('../../', import.meta.url);
let cookie = '';
async function request(route, value) {
  const response = await fetch(origin + route, {
    method: value ? 'POST' : 'GET',
    headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie },
    ...(value ? { body: JSON.stringify(value) } : {}),
  });
  const data = await response.json();
  assert.ok(response.ok, JSON.stringify(data));
  if (route === '/api/auth/verify')
    cookie = response.headers
      .getSetCookie()
      .map((item) => item.split(';')[0])
      .join('; ');
  return data.result ?? data;
}
const docs = Object.values(
  JSON.parse(await readFile(new URL('.data/learning-sandbox/documents.json', root), 'utf8')),
);
const course = docs.find(
  (doc) => doc._type === 'learningCourse' && doc.programId === 'program-sandbox-content-lab',
);
assert.ok(course, 'Create the content-lab draft in the manager UI first');
await request('/api/auth/send', { email: 'manager@example.test' });
await request('/api/auth/verify', { email: 'manager@example.test', code: '123456' });
const draft = await request('/api/admin/courses/' + course.id);
for (const fixture of [
  {
    lesson: 'Композиція та світло',
    kind: 'image',
    title: 'Деталь і фактура',
    path: 'public/images/student-perfume.webp',
    mime: 'image/webp',
    alt: 'Предметна фотографія парфумів як приклад роботи з деталями',
    expectedSeconds: 5,
  },
  {
    lesson: 'План зйомки',
    kind: 'pdf',
    title: 'Робочий аркуш',
    path: 'public/demo-media/workbook.pdf',
    mime: 'application/pdf',
    pageSeconds: [10, 10],
  },
]) {
  const lesson = draft.modules
    .flatMap((module) => module.lessons)
    .find((item) => item.title === fixture.lesson);
  assert.ok(lesson, 'Expected lesson: ' + fixture.lesson);
  if (lesson.blocks.some((block) => block.kind === fixture.kind)) continue;
  const upload = await request('/api/admin/uploads', {
    courseId: course.id,
    kind: fixture.kind,
    title: fixture.title,
    mime: fixture.mime,
  });
  assert.equal(new URL(upload.url).origin, 'http://127.0.0.1:3202');
  const response = await fetch(upload.url, {
    method: upload.method,
    headers: upload.headers,
    body: await readFile(new URL(fixture.path, root)),
  });
  assert.ok(response.ok, 'Fixture upload');
  const media = await request('/api/admin/upload-complete', {
    id: upload.id,
    pageSeconds: fixture.pageSeconds,
  });
  assert.equal(media.status, 'ready');
  lesson.blocks.push({
    id: randomUUID(),
    kind: fixture.kind,
    title: fixture.title,
    required: true,
    revision: 1,
    mediaId: upload.id,
    alt: fixture.alt,
    expectedSeconds: fixture.expectedSeconds,
    pageSeconds: fixture.pageSeconds,
  });
}
await request('/api/admin/courses/' + course.id, { action: 'save', value: draft });
console.log('Local image and two-page PDF are ready in course ' + course.id);
