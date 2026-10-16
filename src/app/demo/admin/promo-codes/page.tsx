import { demoMember } from '@/lib/learning/demo';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminPromoCodes } from '@/components/organisms/AdminPromoCodes/AdminPromoCodes';
export default function PromoCodes() {
  return (
    <WorkspaceShell member={demoMember} admin demo section="promo-codes">
      <AdminPromoCodes
        demo
        programs={[{ id: 'demo-program', title: 'Демонстраційна програма' }]}
        codes={[
          {
            code: 'DEMO5',
            percent: 5,
            active: true,
            startsAt: null,
            expiresAt: null,
            maxUses: null,
            programIds: [],
            note: 'Синтетичний приклад',
            uses: 0,
          },
        ]}
      />
    </WorkspaceShell>
  );
}
