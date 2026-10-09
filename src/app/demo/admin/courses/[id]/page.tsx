import { notFound } from 'next/navigation';
import { demoMember, demoCourse } from '@/lib/learning/demo';
import { demoEditorData } from '@/lib/admin/demo';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { CourseEditor } from '@/components/organisms/CourseEditor/CourseEditor';
import type { IdRouteProps } from '@/app/types';
export function generateStaticParams() {
  return [{ id: demoCourse.id }];
}
export default async function Editor({ params }: IdRouteProps) {
  if ((await params).id !== demoCourse.id) notFound();
  return (
    <WorkspaceShell member={demoMember} admin demo>
      <CourseEditor
        initial={{ ...demoCourse, revision: 'demo-revision' }}
        data={demoEditorData}
        demo
      />
    </WorkspaceShell>
  );
}
