import { demoMember, demoCourse } from '@/lib/learning/demo';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminCourses } from '@/components/organisms/AdminCourses/AdminCourses';
export default function Courses() {
  return (
    <WorkspaceShell member={demoMember} admin demo>
      <AdminCourses
        demo
        data={{
          courses: [
            {
              id: demoCourse.id,
              program_id: demoCourse.programId,
              title: demoCourse.title,
              cover: demoCourse.cover,
              active_release_id: 'demo-release',
              created_at: '2026-10-01T08:00:00Z',
            },
          ],
          programs: [],
        }}
      />
    </WorkspaceShell>
  );
}
