import { demoCourse, demoSession } from '../learning/demo';
import type { CourseEditorData } from './types';
export const demoEditorData: CourseEditorData = {
  releases: [
    {
      id: 'demo-release',
      course_id: demoCourse.id,
      version: 1,
      manifest: demoCourse,
      published_at: '2026-10-01T08:00:00Z',
    },
  ],
  offerings: [
    {
      id: 'demo-intake',
      programId: demoCourse.programId,
      startDate: '2026-10-01',
      duration: '6 тижнів',
      format: 'online',
      availability: 'open',
      verificationRequired: false,
      packages: [
        {
          id: 'demo-base',
          name: 'BASE',
          price: 9900,
          availability: 'open',
          description: 'Приклад пакета',
          includes: ['5 місяців доступу до матеріалів'],
        },
        {
          id: 'demo-platinum',
          name: 'PLATINUM EXPERT',
          price: 24900,
          availability: 'open',
          description: 'Приклад пакета',
          includes: ['Безстроковий доступ'],
        },
      ],
    },
  ],
  rules: [],
  media: [],
  sessions: [demoSession],
};
