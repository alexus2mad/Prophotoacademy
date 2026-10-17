import { notFound } from 'next/navigation';
import { z } from 'zod';
import { pageMember } from '@/lib/auth/server';
import { adminPerson } from '@/lib/admin/queries';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { StudentDetail } from '@/components/organisms/StudentDetail/StudentDetail';
import type { StudentPageProps } from '@/app/types';
export const metadata = { title: 'Студент — ProPhoto', robots: { index: false, follow: false } };
export default async function Student({ params }: StudentPageProps) {
  const raw = decodeURIComponent((await params).email);
  const member = await pageMember('/admin/students/' + encodeURIComponent(raw), true);
  const email = z.string().trim().toLowerCase().pipe(z.email()).safeParse(raw);
  if (!email.success) notFound();
  return (
    <WorkspaceShell member={member} section="students" admin>
      <StudentDetail detail={JSON.parse(JSON.stringify(await adminPerson(email.data)))} />
    </WorkspaceShell>
  );
}
