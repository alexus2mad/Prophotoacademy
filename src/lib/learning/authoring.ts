import { createClient } from '@sanity/client';
import { randomUUID } from 'node:crypto';
import { databasePool, transaction, audit } from '../database/client';
import { HttpError } from '../http';
import { getContent, findImage } from '../content';
import { draftSchema, packageRuleSchema } from './schema';
import type {
  CourseDraft,
  LearningMedia,
  CourseRelease,
  SanityCourseDocument,
  PackageRuleInput,
} from './types';
async function learningClient() {
  const token = process.env.SANITY_LEARNING_WRITE_TOKEN,
    projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_LEARNING_DATASET || 'learning';
  if (!token || !projectId || dataset === (process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'))
    throw new HttpError(503, 'Підключіть окремий приватний простір навчальних матеріалів');
  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2026-10-01',
    useCdn: false,
    perspective: 'raw',
  });
  const datasets = await client.datasets.list();
  if (datasets.find((d) => d.name === dataset)?.aclMode !== 'private')
    throw new HttpError(503, 'Навчальний dataset має бути приватним');
  return client;
}
function sanityModules(draft: CourseDraft) {
  return draft.modules.map((m) => ({
    ...m,
    _key: m.id,
    _type: 'learningModule',
    lessons: m.lessons.map((l) => ({
      ...l,
      _key: l.id,
      _type: 'learningLesson',
      blocks: l.blocks.map((b) => ({ ...b, _key: b.id, _type: 'learningBlock' })),
    })),
  }));
}
export async function createCourse(programId: string, actorId: string) {
  const content = await getContent(),
    program = content.programs.find((p) => p.id === programId);
  if (!program) throw new HttpError(404, 'Програму не знайдено');
  const id = randomUUID();
  const draft: CourseDraft = {
    id,
    programId,
    title: program.title,
    description: program.description,
    cover: findImage(content, program.imageId).src,
    modules: program.modules.map((m) => ({
      id: randomUUID(),
      title: m.title,
      lessons: m.topics.map((title) => ({ id: randomUUID(), title, summary: '', blocks: [] })),
    })),
  };
  return transaction(async (db) => {
    await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [programId]);
    if (
      (await db.query('SELECT id FROM academy.courses WHERE program_id=$1', [programId])).rowCount
    )
      throw new HttpError(409, 'Для цієї програми курс уже створено');
    const doc = await (
      await learningClient()
    ).create({
      _type: 'learningCourse',
      ...draft,
      modules: sanityModules(draft),
    });
    await db.query(
      'INSERT INTO academy.courses(id,program_id,title,cover,sanity_id) VALUES($1,$2,$3,$4,$5)',
      [id, programId, draft.title, draft.cover, doc._id],
    );
    await audit(db, { actorId, action: 'course.create', target: id });
    return { ...draft, revision: doc._rev };
  });
}
export async function getDraft(id: string) {
  const row = (
    await databasePool().query('SELECT sanity_id FROM academy.courses WHERE id=$1', [id])
  ).rows[0];
  if (!row?.sanity_id) throw new HttpError(404, 'Курс не знайдено');
  const doc = await (await learningClient()).getDocument<SanityCourseDocument>(row.sanity_id);
  if (!doc) throw new HttpError(404, 'Чернетку не знайдено');
  return draftSchema.parse({ ...doc, revision: doc._rev });
}
export async function saveDraft(id: string, input: unknown, actorId: string) {
  const draft = draftSchema.parse(input),
    old = await getDraft(id);
  if (draft.id !== id || draft.programId !== old.programId)
    throw new HttpError(400, 'Ідентифікатор курсу не можна змінити');
  if (!draft.revision || draft.revision !== old.revision)
    throw new HttpError(409, 'Курс змінив інший адміністратор. Перезавантажте чернетку');
  const published = (
    await databasePool().query<CourseRelease>(
      'SELECT * FROM academy.releases WHERE course_id=$1 ORDER BY version DESC',
      [id],
    )
  ).rows;
  const previous = [old, ...published.map((r) => r.manifest)].flatMap((c) =>
    c.modules.flatMap((m) => m.lessons.flatMap((l) => l.blocks)),
  );
  for (const block of draft.modules.flatMap((m) => m.lessons.flatMap((l) => l.blocks))) {
    const known = previous.filter((b) => b.id === block.id),
      before = known[0];
    const unchanged =
      before &&
      before.kind === block.kind &&
      before.mediaId === block.mediaId &&
      before.body === block.body;
    block.revision = unchanged ? before.revision : Math.max(0, ...known.map((b) => b.revision)) + 1;
  }
  const { revision, ...value } = draft;
  const row = (
    await databasePool().query('SELECT sanity_id FROM academy.courses WHERE id=$1', [id])
  ).rows[0];
  try {
    const doc = await (
      await learningClient()
    )
      .patch(row.sanity_id)
      .ifRevisionId(revision)
      .set({ ...value, modules: sanityModules(draft) })
      .commit();
    await audit(databasePool(), { actorId, action: 'course.save', target: id });
    return { ...draft, revision: doc._rev };
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 409)
      throw new HttpError(409, 'Курс змінив інший адміністратор');
    throw error;
  }
}
export async function publishCourse(id: string, revision: string, actorId: string) {
  const draft = await getDraft(id);
  if (revision !== draft.revision)
    throw new HttpError(409, 'Спочатку збережіть останню версію курсу');
  const lessons = draft.modules.flatMap((m) => m.lessons);
  if (!lessons.length || lessons.some((l) => !l.blocks.length || !l.blocks.some((b) => b.required)))
    throw new HttpError(
      400,
      'Додайте матеріали та принаймні один обов’язковий блок до кожного уроку',
    );
  const media = (
    await databasePool().query<LearningMedia>('SELECT * FROM academy.media WHERE course_id=$1', [
      id,
    ])
  ).rows;
  for (const lesson of lessons)
    for (const block of lesson.blocks) {
      if (block.kind === 'file' && block.required)
        throw new HttpError(
          400,
          'Для обов’язкового PDF використайте PDF-блок із відстеженням читання',
        );
      if (block.kind === 'article' && !block.body?.trim())
        throw new HttpError(400, 'Заповніть текст уроків');
      if (block.kind === 'image' && !block.alt?.trim())
        throw new HttpError(400, 'Додайте альтернативний опис зображень');
      if (['video', 'pdf', 'image', 'file'].includes(block.kind)) {
        const asset = media.find(
          (m) =>
            m.id === block.mediaId &&
            m.status === 'ready' &&
            (m.kind === block.kind || (block.kind === 'file' && m.kind === 'pdf')),
        );
        if (!asset) throw new HttpError(400, 'Зачекайте завершення завантаження всіх матеріалів');
        if (block.kind === 'video') block.duration = Number(asset.duration);
        if (block.kind === 'pdf') {
          const count = Number(asset.page_count);
          if (!count) throw new HttpError(400, 'Перевірте кількість сторінок PDF');
          block.pageSeconds = Array.from(
            { length: count },
            (_, i) => block.pageSeconds?.[i] || asset.metadata?.pageSeconds?.[i] || 10,
          );
        }
      }
    }
  return transaction(async (db) => {
    await db.query('SELECT id FROM academy.courses WHERE id=$1 FOR UPDATE', [id]);
    const version = (
      await db.query(
        'SELECT coalesce(max(version),0)+1 AS version FROM academy.releases WHERE course_id=$1',
        [id],
      )
    ).rows[0].version;
    const releaseId = randomUUID(),
      { revision: ignored, ...manifest } = draft;
    void ignored;
    const client = await learningClient();
    const source = (await db.query('SELECT sanity_id FROM academy.courses WHERE id=$1', [id]))
      .rows[0];
    const sanityId = 'learningRelease.' + releaseId;
    try {
      await client
        .transaction()
        .patch(source.sanity_id, (patch) =>
          patch.ifRevisionId(revision).set({ lastPublishedAt: new Date().toISOString() }),
        )
        .create({
          _id: sanityId,
          _type: 'learningRelease',
          courseId: id,
          version,
          manifest: { ...manifest, modules: sanityModules(draft) },
        })
        .commit();
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error && error.statusCode === 409)
        throw new HttpError(409, 'Чернетку змінено під час публікації. Оновіть курс');
      throw error;
    }
    await db.query(
      'INSERT INTO academy.releases(id,course_id,version,manifest,sanity_id) VALUES($1,$2,$3,$4,$5)',
      [releaseId, id, version, JSON.stringify(manifest), sanityId],
    );
    await db.query(
      'UPDATE academy.courses SET active_release_id=$1,title=$2,cover=$3 WHERE id=$4',
      [releaseId, draft.title, draft.cover, id],
    );
    await audit(db, {
      actorId,
      action: 'course.publish',
      target: id,
      after: { releaseId, version },
    });
    return { releaseId, version };
  });
}
export async function savePackageRule(courseId: string, input: PackageRuleInput, actorId: string) {
  const rule = packageRuleSchema.parse(input),
    content = await getContent();
  const release = (
    await databasePool().query<CourseRelease>(
      'SELECT * FROM academy.releases WHERE id=$1 AND course_id=$2',
      [rule.releaseId, courseId],
    )
  ).rows[0];
  const offering = content.offerings.find(
    (o) => o.id === rule.offeringId && o.programId === release?.manifest.programId,
  );
  if (!release || !offering?.packages.some((p) => p.id === rule.packageId))
    throw new HttpError(400, 'Оберіть пакет цієї програми');
  const promise = offering.packages.find((p) => p.id === rule.packageId)!.includes.join(' ');
  const months = promise.match(/Доступ(?: до матеріалів)? (\d+) місяц/i)?.[1];
  if (months && rule.accessMonths !== Number(months))
    throw new HttpError(
      400,
      'Термін доступу має відповідати опублікованому пакету: ' + months + ' місяців',
    );
  if (
    /Доступ(?: до матеріалів)? назавжди|безстроковий доступ/i.test(promise) &&
    rule.accessMonths !== null
  )
    throw new HttpError(400, 'Цей пакет обіцяє безстроковий доступ');
  const lessons = release.manifest.modules.flatMap((m) => m.lessons.map((l) => l.id));
  if (rule.lessonIds.some((id) => !lessons.includes(id)))
    throw new HttpError(400, 'Невідомий урок у пакеті');
  await transaction(async (db) => {
    await db.query(
      'INSERT INTO academy.package_rules(offering_id,package_id,course_id,release_id,lesson_ids,access_months,starts_at) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(offering_id,package_id) DO UPDATE SET release_id=excluded.release_id,lesson_ids=excluded.lesson_ids,access_months=excluded.access_months,starts_at=excluded.starts_at',
      [
        rule.offeringId,
        rule.packageId,
        courseId,
        rule.releaseId,
        JSON.stringify(rule.lessonIds),
        rule.accessMonths,
        rule.startsAt,
      ],
    );
    await audit(db, {
      actorId,
      action: 'package.configure',
      target: rule.offeringId + ':' + rule.packageId,
      after: rule,
    });
  });
}
