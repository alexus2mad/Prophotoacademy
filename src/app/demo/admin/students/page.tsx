import { demoMember } from '@/lib/learning/demo';
import { demoOverview, demoPeople, demoRoster } from '@/lib/admin/demo';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminStudents } from '@/components/organisms/AdminStudents/AdminStudents';
export default function Students() {
  return (
    <WorkspaceShell member={demoMember} admin demo section="students">
      <AdminStudents
        overview={demoOverview}
        people={demoPeople}
        query=""
        demo
        demoRoster={demoRoster}
      />
    </WorkspaceShell>
  );
}
