import type { CourseDraft, EnrolledCourse, ProgressRow, LiveSession } from './types';
import type { Member } from '../auth/types';
export const demoMember: Member = {
  id: '00000000-0000-4000-8000-000000000010',
  email: 'student@example.com',
  name: 'Олександра',
  role: 'admin',
  verified_at: '2026-10-09T08:00:00Z',
  created_at: '2026-10-01T08:00:00Z',
};
export const demoCourse: CourseDraft = {
  id: 'instagram',
  programId: 'program-instagram',
  title: 'Інста, яка продає',
  description: 'Від першої ідеї до впізнаваного контенту вашого бренду',
  cover: '/images/instagram.webp',
  modules: [
    {
      id: 'foundation',
      title: 'Основа вашого бренду',
      lessons: [
        {
          id: 'welcome',
          title: 'Знайомство з курсом',
          summary: 'Як рухатися програмою та зберігати власний темп',
          introductory: true,
          blocks: [
            {
              id: 'welcome-text',
              kind: 'article',
              title: 'Ваш простір для навчання',
              required: true,
              revision: 1,
              body: 'Це демонстраційний урок кабінету ProPhoto. Він показує, як виглядатимуть матеріали та збереження прогресу.\n\n## Навчайтеся у своєму темпі\n\nВідкривайте уроки в зручному порядку. Кабінет запам’ятає, де ви зупинилися. Відео, конспекти й матеріали до заняття зібрані на одній сторінці.\n\n## Повертайтеся до важливого\n\nПрогрес зберігається автоматично. Якщо ви опрацювали матеріал поза кабінетом, можете підтвердити це самостійно.',
            },
          ],
        },
        {
          id: 'positioning',
          title: 'Позиціонування та ваша аудиторія',
          summary: 'Визначте, для кого ви створюєте контент і яку цінність пропонуєте',
          blocks: [
            {
              id: 'positioning-text',
              kind: 'article',
              title: 'Почніть із людини',
              required: true,
              revision: 1,
              body: 'Це приклад оформлення статті, а не матеріал платного курсу.\n\n## Кому ви допомагаєте\n\nПеред зйомкою сформулюйте одну конкретну потребу своєї аудиторії. Вона допоможе обрати сюжет, композицію та слова.\n\n- Яке питання людина ставить найчастіше?\n- Що їй важливо побачити перед рішенням?\n- Який один висновок має залишитися після публікації?\n\n## Одна публікація — одна думка\n\nЧітка ідея допомагає прибрати зайве. Залиште те, що підтримує вашу думку, і дайте фотографії достатньо простору.',
            },
          ],
        },
      ],
    },
    {
      id: 'visual',
      title: 'Контент, який впізнають',
      lessons: [
        {
          id: 'visual-language',
          title: 'Візуальна мова вашого бренду',
          summary: 'Колір, світло й композиція, які працюють разом',
          blocks: [
            {
              id: 'visual-image',
              kind: 'image',
              title: 'Знайдіть головний акцент',
              required: true,
              revision: 1,
              mediaId: '00000000-0000-4000-8000-000000000020',
              alt: 'Червона тканина створює виразну лінію над морем',
              caption: 'Фотографія з бібліотеки ProPhoto · Олена Попова',
            },
            {
              id: 'visual-article',
              kind: 'article',
              title: 'Подивіться уважніше',
              required: true,
              revision: 1,
              body: 'Цей демонстраційний матеріал показує, як зображення і текст поєднуються в уроці.\n\n## Що привертає увагу першим\n\nПодивіться на напрям тканини, співвідношення теплого й холодного та простір довкола головного об’єкта. Кожен із цих елементів впливає на те, як ми читаємо кадр.\n\n## Спробуйте на власній фотографії\n\nОберіть один кадр зі своєї галереї. Знайдіть його головний акцент, приберіть зайві деталі та порівняйте відчуття до і після.\n\nЗміни не завжди мають бути великими. Іноді достатньо змінити межі кадру або залишити більше повітря.',
            },
          ],
        },
        {
          id: 'video-story',
          title: 'Історія у короткому відео',
          summary: 'Побудова кадру, ритм і ясна послідовність',
          blocks: [
            {
              id: 'video-demo',
              kind: 'video',
              title: 'Демонстрація відеоплеєра',
              required: true,
              revision: 1,
              duration: 12,
              mediaId: '00000000-0000-4000-8000-000000000021',
            },
          ],
        },
        {
          id: 'workbook',
          title: 'Практикум: план контенту',
          summary: 'Зберіть свої ідеї у зрозумілий план',
          blocks: [
            {
              id: 'pdf-demo',
              kind: 'pdf',
              title: 'Робочий зошит · приклад',
              required: true,
              revision: 1,
              pageSeconds: [10, 10],
              mediaId: '00000000-0000-4000-8000-000000000022',
            },
          ],
        },
      ],
    },
    {
      id: 'practice',
      title: 'Практика та зворотний зв’язок',
      lessons: [
        {
          id: 'live-review',
          title: 'Розбір ваших ідей у Zoom',
          summary: 'Жива зустріч із викладачем',
          blocks: [
            {
              id: 'zoom-demo',
              kind: 'zoom',
              title: 'Груповий розбір',
              required: true,
              revision: 1,
              expectedSeconds: 3600,
            },
          ],
        },
      ],
    },
  ],
};
export const demoSession: LiveSession = {
  id: '00000000-0000-4000-8000-000000000030',
  course_id: 'instagram',
  lesson_id: 'live-review',
  offering_id: 'demo-intake',
  title: 'Розбір ваших ідей',
  zoom_url: '',
  starts_at: '2026-10-15T16:00:00Z',
  ends_at: '2026-10-15T17:30:00Z',
  timezone: 'Europe/Kyiv',
  status: 'scheduled',
  recording_media_id: null,
};
const demoProgress: ProgressRow[] = demoCourse.modules[0].lessons.map((lesson) => ({
  user_id: demoMember.id,
  course_id: 'instagram',
  lesson_id: lesson.id,
  state: {
    blocks: {},
    manual: 'student',
    manualRevisions: Object.fromEntries(
      lesson.blocks.filter((b) => b.required).map((b) => [b.id, b.revision]),
    ),
  },
  completed_at: '2026-10-08T10:00:00Z',
  completion_source: 'student',
  updated_at: '2026-10-08T10:00:00Z',
}));
export const demoEnrollment: EnrolledCourse = {
  course: demoCourse,
  releaseId: 'demo-release',
  grants: [
    {
      id: '00000000-0000-4000-8000-000000000040',
      user_id: demoMember.id,
      email: demoMember.email,
      course_id: 'instagram',
      release_id: 'demo-release',
      lesson_ids: demoCourse.modules.flatMap((m) => m.lessons.map((l) => l.id)),
      package_name: 'PLATINUM EXPERT',
      source_order_id: null,
      source: 'admin',
      starts_at: '2026-10-01T08:00:00Z',
      expires_at: null,
      revoked_at: null,
      created_at: '2026-10-01T08:00:00Z',
      offering_id: 'demo-intake',
    },
  ],
  progress: demoProgress,
  sessions: [demoSession],
};
export const demoMedia: Record<string, string> = {
  '00000000-0000-4000-8000-000000000020': '/images/instagram.webp',
  '00000000-0000-4000-8000-000000000021':
    'https://storage.googleapis.com/muxdemofiles/mux-video-intro.mp4',
  '00000000-0000-4000-8000-000000000022': '/demo-media/workbook.pdf',
};
