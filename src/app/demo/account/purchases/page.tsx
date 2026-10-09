import { demoMember } from '@/lib/learning/demo';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { PurchaseHistory } from '@/components/organisms/PurchaseHistory/PurchaseHistory';
export default function Purchases() {
  return (
    <WorkspaceShell demo member={demoMember} section="purchases">
      <div className="workspace-page-heading">
        <h1>Мої покупки</h1>
        <p>Демонстраційна покупка</p>
      </div>
      <PurchaseHistory
        purchases={[
          {
            id: 'demo-order',
            title: 'Інста, яка продає',
            packageName: 'PLATINUM EXPERT',
            amount: 2490000,
            currency: 'UAH',
            status: 'approved',
            createdAt: '2026-10-01T08:00:00Z',
          },
        ]}
      />
    </WorkspaceShell>
  );
}
