import { SiteContentEditor } from '@/components/organisms/SiteContentEditor/SiteContentEditor';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { pageMember } from '@/lib/auth/server';
import { listEditorPages, siteEditorWritable } from '@/lib/site-editor/store';

export const metadata = {
  title: 'Сторінки сайту — ProPhoto',
  robots: { index: false, follow: false },
};

export default async function ContentEditorPage() {
  const member = await pageMember('/admin/content', true);
  const pages = await listEditorPages();
  return (
    <WorkspaceShell member={member} admin section="content">
      <SiteContentEditor initialPages={pages} writable={siteEditorWritable()} />
    </WorkspaceShell>
  );
}
