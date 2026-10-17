import { demoCourse, demoMember, demoSession } from '../learning/demo';
import type {
  AdminOverviewData,
  AdminPerson,
  CourseEditorData,
  RosterPerson,
  TeamData,
  UserDetail,
} from './types';
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

// Synthetic people only: the public review never shows real students.
export const demoStudentEmail = 'student@example.com';
const demoStudent: AdminPerson = { ...demoMember, role: 'student', course_count: 1 };
export const demoOverview: AdminOverviewData = {
  courses: 1,
  students: 2,
  activeGrants: 1,
  unpublished: 0,
  failedMedia: 0,
  pendingEmails: 0,
  sessions: [
    { ...demoSession, starts_at: '2099-10-21T16:00:00Z', ends_at: '2099-10-21T17:30:00Z' },
  ],
  courseStats: [
    { id: demoCourse.id, title: demoCourse.title, students: 1, completed: 0, progress: 0.4 },
  ],
};
export const demoPeople: AdminPerson[] = [
  demoStudent,
  {
    ...demoMember,
    id: '00000000-0000-4000-8000-000000000011',
    email: 'admin@example.com',
    name: 'Адміністратор',
    course_count: 0,
  },
];
export const demoRoster: RosterPerson[] = [
  { id: demoStudent.id, email: demoStudent.email, name: demoStudent.name, attended: false },
];
export const demoStudentDetail: UserDetail = {
  profile: demoStudent,
  email: demoStudentEmail,
  grants: [
    {
      id: '00000000-0000-4000-8000-000000000020',
      user_id: demoStudent.id,
      email: demoStudentEmail,
      course_id: demoCourse.id,
      release_id: 'demo-release',
      lesson_ids: demoCourse.modules.flatMap((m) => m.lessons.map((l) => l.id)),
      package_name: 'BASE',
      source_order_id: null,
      source: 'purchase',
      starts_at: '2026-10-01T08:00:00Z',
      expires_at: '2027-03-01T21:59:59Z',
      revoked_at: null,
      created_at: '2026-10-01T08:00:00Z',
    },
  ],
  progress: [],
  courses: demoEditorData.releases,
  purchases: [
    {
      id: 'ppa-demo',
      title: demoCourse.title,
      packageName: 'BASE',
      amount: 990000,
      currency: 'UAH',
      status: 'approved',
      createdAt: '2026-10-01T08:00:00Z',
    },
  ],
};
export const demoTeam: TeamData = {
  members: [{ ...demoMember, email: 'admin@example.com', name: 'Адміністратор' }],
  invitations: [{ email: 'teacher@example.com', created_at: '2026-10-10T08:00:00Z' }],
};
