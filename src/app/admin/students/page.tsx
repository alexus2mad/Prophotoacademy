import { pageMember } from '@/lib/auth/server';
import { adminOverview, adminPeople } from '@/lib/admin/queries';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminStudents } from '@/components/organisms/AdminStudents/AdminStudents';
import type { StudentsPageProps } from '@/app/types';
export const metadata = { title: 'Студенти — ProPhoto', robots: { index: false, follow: false } };
export default async function Students({ searchParams }: StudentsPageProps) {
  const member = await pageMember('/admin/students', true);
  const query = ((await searchParams).q || '').slice(0, 100);
  const [overview, people] = await Promise.all([adminOverview(), adminPeople(query)]);
  return (
    <WorkspaceShell member={member} section="students" admin>
      <AdminStudents
        overview={JSON.parse(JSON.stringify(overview))}
        people={JSON.parse(JSON.stringify(people))}
        query={query}
      />
    </WorkspaceShell>
  );
}
