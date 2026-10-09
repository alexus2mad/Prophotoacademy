import { z } from 'zod';
const id = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const blockSchema = z.object({
  id,
  kind: z.enum(['video', 'article', 'image', 'pdf', 'file', 'zoom']),
  title: z.string().max(160),
  required: z.boolean(),
  body: z.string().max(100_000).optional(),
  alt: z.string().max(500).optional(),
  caption: z.string().max(1000).optional(),
  mediaId: z.uuid().optional(),
  expectedSeconds: z.number().positive().max(86400).optional(),
  duration: z.number().positive().optional(),
  pageSeconds: z.array(z.number().positive().max(3600)).max(1000).optional(),
  revision: z.number().int().min(1),
});
export const lessonSchema = z.object({
  id,
  title: z.string().min(1).max(180),
  summary: z.string().max(2000),
  releaseAt: z.iso.datetime().optional(),
  introductory: z.boolean().optional(),
  blocks: z.array(blockSchema).max(100),
});
export const draftSchema = z
  .object({
    id,
    programId: id,
    title: z.string().min(1).max(180),
    description: z.string().max(4000),
    cover: z.string().max(1000),
    modules: z
      .array(
        z.object({
          id,
          title: z.string().min(1).max(180),
          lessons: z.array(lessonSchema).max(200),
        }),
      )
      .max(100),
    revision: z.string().optional(),
  })
  .superRefine((course, ctx) => {
    const ids = course.modules.flatMap((m) => [
      m.id,
      ...m.lessons.flatMap((l) => [l.id, ...l.blocks.map((b) => b.id)]),
    ]);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: 'custom', message: 'Ідентифікатори матеріалів мають бути унікальні' });
  });
export const packageRuleSchema = z.object({
  offeringId: id,
  packageId: id,
  releaseId: id,
  lessonIds: z.array(id).min(1),
  accessMonths: z.number().int().min(1).max(120).nullable(),
  startsAt: z.iso.datetime().nullable(),
});
export const progressSchema = z.object({
  observedAt: z.iso.datetime().optional(),
  id: z.uuid(),
  sessionId: z.uuid(),
  sequence: z.number().int().nonnegative(),
  blockId: id,
  revision: z.number().int().positive(),
  elapsed: z.number().min(0).max(30),
  ranges: z
    .array(z.tuple([z.number().nonnegative(), z.number().nonnegative()]))
    .max(30)
    .optional(),
  coverage: z.array(z.number().int().min(0).max(99)).max(100).optional(),
  page: z.number().int().nonnegative().optional(),
  position: z.number().nonnegative().optional(),
  manual: z.boolean().optional(),
});
export const liveSchema = z
  .object({
    id: z.uuid().optional(),
    course_id: id,
    lesson_id: id,
    offering_id: z.string().nullable(),
    title: z.string().min(1).max(180),
    zoom_url: z.url().refine((value) => {
      const u = new URL(value);
      return (
        u.protocol === 'https:' &&
        (u.hostname === 'zoom.us' ||
          u.hostname.endsWith('.zoom.us') ||
          u.hostname === 'zoom.com' ||
          u.hostname.endsWith('.zoom.com'))
      );
    }, 'Потрібне HTTPS-посилання Zoom'),
    starts_at: z.iso.datetime(),
    ends_at: z.iso.datetime(),
    timezone: z.literal('Europe/Kyiv'),
    status: z.enum(['scheduled', 'rescheduled', 'canceled']),
    recording_media_id: z.uuid().nullable(),
  })
  .refine(
    (value) => Date.parse(value.ends_at) > Date.parse(value.starts_at),
    'Час завершення має бути пізніше початку',
  );
