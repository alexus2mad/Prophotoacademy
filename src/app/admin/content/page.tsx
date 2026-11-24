import { SiteContentEditor } from '@/components/organisms/SiteContentEditor/SiteContentEditor';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { pageMember } from '@/lib/auth/server';
import { listEditorPages, siteEditorWritable } from '@/lib/site-editor/store';
import {
  contentSyncRole,
  stagingTargetAvailable,
  withEditorTarget,
} from '@/lib/site-editor/storage/config';

import { workshopTicketChoices } from '@/lib/site-editor/workshop-ticket/presentation';

export const metadata = {
  title: 'Сторінки сайту — ProPhoto',
  robots: { index: false, follow: false },
};

export default async function ContentEditorPage() {
  const member = await pageMember('/admin/content', true);
  // The production admin also manages staging content when it holds the staging writer.
  const [pages, stagingPages, tickets] = await Promise.all([
    listEditorPages(),
    stagingTargetAvailable() ? withEditorTarget('staging', () => listEditorPages()) : undefined,
    workshopTicketChoices(),
  ]);
  return (
    <WorkspaceShell member={member} admin section="content">
      <SiteContentEditor
        tickets={tickets}
        initialPages={pages}
        stagingPages={stagingPages}
        writable={siteEditorWritable()}
        sync={contentSyncRole()}
      />
    </WorkspaceShell>
  );
}
