import { SiteContentEditor } from '@/components/organisms/SiteContentEditor/SiteContentEditor';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { pageMember } from '@/lib/auth/server';
import { listEditorPages, siteEditorWritable } from '@/lib/site-editor/store';

import { workshopTicketChoices } from '@/lib/site-editor/workshop-ticket/presentation';

export const metadata = {
  title: 'Сторінки сайту — ProPhoto',
  robots: { index: false, follow: false },
};

export default async function ContentEditorPage() {
  const member = await pageMember('/admin/content', true);
  const [pages, tickets] = await Promise.all([listEditorPages(), workshopTicketChoices()]);
  return (
    <WorkspaceShell member={member} admin section="content">
      <SiteContentEditor tickets={tickets} initialPages={pages} writable={siteEditorWritable()} />
    </WorkspaceShell>
  );
}
