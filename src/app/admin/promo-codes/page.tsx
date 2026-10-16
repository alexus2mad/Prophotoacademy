import { pageMember } from '@/lib/auth/server';
import { getContent } from '@/lib/content';
import { listPromoCodes } from '@/lib/commerce/promo';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminPromoCodes } from '@/components/organisms/AdminPromoCodes/AdminPromoCodes';
export default async function PromoCodes() {
  const member = await pageMember('/admin/promo-codes', true);
  const content = await getContent();
  // Only programs with priced packages can take a discount.
  const programs = content.programs
    .filter((p) => content.offerings.some((o) => o.programId === p.id && o.packages.length))
    .map((p) => ({ id: p.id, title: p.title }));
  return (
    <WorkspaceShell member={member} section="promo-codes" admin>
      <AdminPromoCodes codes={await listPromoCodes()} programs={programs} />
    </WorkspaceShell>
  );
}
