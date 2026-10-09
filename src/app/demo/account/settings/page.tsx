import { demoMember } from '@/lib/learning/demo';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AccountSettings } from '@/components/organisms/AccountSettings/AccountSettings';
export default function Settings() {
  return (
    <WorkspaceShell demo member={demoMember} section="settings">
      <div className="workspace-page-heading">
        <h1>Мій профіль</h1>
      </div>
      <AccountSettings member={demoMember} demo />
    </WorkspaceShell>
  );
}
