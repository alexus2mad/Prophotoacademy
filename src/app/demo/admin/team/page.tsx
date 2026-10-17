import { demoMember } from '@/lib/learning/demo';
import { demoTeam } from '@/lib/admin/demo';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminTeam } from '@/components/organisms/AdminTeam/AdminTeam';
export default function Team() {
  return (
    <WorkspaceShell member={demoMember} admin demo section="team">
      <AdminTeam data={demoTeam} demo />
    </WorkspaceShell>
  );
}
