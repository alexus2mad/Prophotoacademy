import { z } from 'zod';
import { youtubeVideoId } from './youtube';
const id = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const blockSchema = z.object({
  id,
  kind: z.enum(['video', 'article', 'image', 'pdf', 'file', 'zoom', 'quiz']),
  title: z.string().max(160),
  required: z.boolean(),
  body: z.string().max(100_000).optional(),
  alt: z.string().max(500).optional(),
  caption: z.string().max(1000).optional(),
  imageWidth: z.number().int().positive().max(30000).optional(),
  imageHeight: z.number().int().positive().max(30000).optional(),
  imageLayout: z.literal('wide').optional(),
  mediaId: z.uuid().optional(),
  youtubeUrl: z
    .string()
    .max(500)
    .refine((url) => !!youtubeVideoId(url), 'Вставте дійсне HTTPS-посилання на відео YouTube')
    .optional(),
  expectedSeconds: z.number().positive().max(86400).optional(),
  duration: z.number().positive().optional(),
  pageSeconds: z.array(z.number().positive().max(3600)).max(1000).optional(),
  revision: z.number().int().min(1),
  presentation: z.enum(['reading', 'practice']).optional(),
  quiz: z
    .object({
      passingScore: z.number().int().min(1).max(100),
      questions: z
        .array(
          z.object({
            id,
            prompt: z.string().max(1000),
            options: z
              .array(z.object({ id, text: z.string().max(1000) }))
              .min(2)
              .max(6),
            correctOptionId: id.optional(),
            explanation: z.string().max(2000).optional(),
          }),
        )
        .max(20),
    })
    .superRefine((quiz, ctx) => {
      const unique = (values: string[]) => new Set(values).size === values.length;
      if (
        !unique(quiz.questions.map((q) => q.id)) ||
        quiz.questions.some((q) => !unique(q.options.map((o) => o.id)))
      )
        ctx.addIssue({
          code: 'custom',
          message: 'Запитання й варіанти мають мати унікальні ідентифікатори',
        });
    })
    .optional(),
});
export const lessonSchema = z.object({
  id,
  number: z.number().int().min(1).max(20000).optional(),
  title: z.string().min(1).max(180),
  summary: z.string().max(2000),
  releaseAt: z.iso.datetime().optional(),
  introductory: z.boolean().optional(),
  blocks: z.array(blockSchema).max(300),
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
    const numbers = course.modules.flatMap((m) =>
      m.lessons.flatMap((l) => (l.number ? [l.number] : [])),
    );
    if (new Set(numbers).size !== numbers.length)
      ctx.addIssue({ code: 'custom', message: 'Номери лекцій у курсі мають бути унікальні' });
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
export const publicationSchema = z.object({
  revision: z.string().min(1),
  lessonIds: z.array(id).min(1).max(20000).optional(),
});
export const progressSchema = z
  .object({
    kind: z.enum(['quiz', 'resume']).optional(),
    observedAt: z.iso.datetime().optional(),
    id: z.uuid(),
    sessionId: z.uuid(),
    sequence: z.number().int().nonnegative(),
    blockId: id,
    revision: z.number().int().positive(),
    elapsed: z.number().min(0).max(30).optional(),
    ranges: z
      .array(z.tuple([z.number().nonnegative(), z.number().nonnegative()]))
      .max(30)
      .optional(),
    coverage: z.array(z.number().int().min(0).max(99)).max(100).optional(),
    page: z.number().int().nonnegative().optional(),
    position: z.number().nonnegative().optional(),
    manual: z.boolean().optional(),
    quizAnswers: z
      .record(id, id)
      .refine((answers) => Object.keys(answers).length <= 20)
      .optional(),
  })
  .refine((event) => event.kind !== 'quiz' || !!event.quizAnswers, 'Потрібні відповіді на тест');
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
