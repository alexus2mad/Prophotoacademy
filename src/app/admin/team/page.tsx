import { pageMember } from '@/lib/auth/server';
import { adminTeam } from '@/lib/admin/queries';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminTeam } from '@/components/organisms/AdminTeam/AdminTeam';
export const metadata = { title: 'Команда — ProPhoto', robots: { index: false, follow: false } };
export default async function Team() {
  const member = await pageMember('/admin/team', true);
  return (
    <WorkspaceShell member={member} section="team" admin>
      <AdminTeam data={JSON.parse(JSON.stringify(await adminTeam()))} />
    </WorkspaceShell>
  );
}
