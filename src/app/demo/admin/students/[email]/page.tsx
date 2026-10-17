import { notFound } from 'next/navigation';
import { demoMember } from '@/lib/learning/demo';
import { demoStudentDetail, demoStudentEmail } from '@/lib/admin/demo';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { StudentDetail } from '@/components/organisms/StudentDetail/StudentDetail';
import type { StudentPageProps } from '@/app/types';
export function generateStaticParams() {
  return [{ email: demoStudentEmail }];
}
export default async function Student({ params }: StudentPageProps) {
  if (decodeURIComponent((await params).email) !== demoStudentEmail) notFound();
  return (
    <WorkspaceShell member={demoMember} admin demo section="students">
      <StudentDetail detail={demoStudentDetail} demo />
    </WorkspaceShell>
  );
}
