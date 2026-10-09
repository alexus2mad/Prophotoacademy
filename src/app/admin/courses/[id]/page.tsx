import { pageMember } from '@/lib/auth/server';
import { courseEditorData } from '@/lib/admin/queries';
import { getDraft } from '@/lib/learning/authoring';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { CourseEditor } from '@/components/organisms/CourseEditor/CourseEditor';
import type { IdRouteProps } from '@/app/types';
export default async function Editor({ params }: IdRouteProps) {
  const { id } = await params,
    member = await pageMember('/admin/courses/' + id, true);
  const [draft, data] = await Promise.all([getDraft(id), courseEditorData(id)]);
  return (
    <WorkspaceShell member={member} admin>
      <CourseEditor key={draft.revision} initial={draft} data={JSON.parse(JSON.stringify(data))} />
    </WorkspaceShell>
  );
}
