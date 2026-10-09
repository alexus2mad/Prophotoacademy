import { pageMember } from '@/lib/auth/server';
import { adminCourses } from '@/lib/admin/queries';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminCourses } from '@/components/organisms/AdminCourses/AdminCourses';
export const metadata = {
  title: 'Матеріали курсів — ProPhoto',
  robots: { index: false, follow: false },
};
export default async function Courses() {
  const member = await pageMember('/admin/courses', true);
  return (
    <WorkspaceShell member={member} admin>
      <AdminCourses data={JSON.parse(JSON.stringify(await adminCourses()))} />
    </WorkspaceShell>
  );
}
