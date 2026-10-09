import { pageMember } from '@/lib/auth/server';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AccountSettings } from '@/components/organisms/AccountSettings/AccountSettings';
export const metadata = {
  title: 'Мій профіль — ProPhoto',
  robots: { index: false, follow: false },
};
export default async function Settings() {
  const member = await pageMember('/account/settings');
  return (
    <WorkspaceShell member={member} section="settings">
      <div className="workspace-page-heading">
        <h1>Мій профіль</h1>
      </div>
      <AccountSettings member={JSON.parse(JSON.stringify(member))} />
    </WorkspaceShell>
  );
}
