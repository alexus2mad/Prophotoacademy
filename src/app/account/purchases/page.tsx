import { pageMember } from '@/lib/auth/server';
import { purchasesFor } from '@/lib/admin/queries';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { PurchaseHistory } from '@/components/organisms/PurchaseHistory/PurchaseHistory';
export const metadata = {
  title: 'Мої покупки — ProPhoto',
  robots: { index: false, follow: false },
};
export default async function Purchases() {
  const member = await pageMember('/account/purchases');
  return (
    <WorkspaceShell member={member} section="purchases">
      <div className="workspace-page-heading">
        <h1>Мої покупки</h1>
        <p>Історія навчання за вашим email</p>
      </div>
      <PurchaseHistory purchases={await purchasesFor(member.email)} />
    </WorkspaceShell>
  );
}
