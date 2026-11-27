import { pageMember } from '@/lib/auth/server';
import { inquiriesForwarded, listInquiries } from '@/lib/inquiries/admin';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminInquiries } from '@/components/organisms/AdminInquiries/AdminInquiries';

export default async function Inquiries() {
  const member = await pageMember('/admin/inquiries', true);
  return (
    <WorkspaceShell member={member} section="inquiries" admin>
      <AdminInquiries inquiries={await listInquiries()} forwarded={inquiriesForwarded()} />
    </WorkspaceShell>
  );
}
