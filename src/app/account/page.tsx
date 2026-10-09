import { pageMember } from '@/lib/auth/server';
import { studentCourses } from '@/lib/learning/service';
import { enrollmentCard } from '@/lib/learning/selectors';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { StudentOverview } from '@/components/organisms/StudentOverview/StudentOverview';
export const metadata = { title: 'Мої курси · ProPhoto', robots: { index: false, follow: false } };
export default async function AccountPage() {
  const member = await pageMember(),
    courses = await studentCourses(member.id);
  const nextSession = courses
    .flatMap((c) => c.sessions)
    .filter((s) => s.status !== 'canceled' && Date.parse(s.ends_at) > Date.now())
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0];
  return (
    <WorkspaceShell member={member}>
      <StudentOverview
        name={member.name}
        courses={courses.map(enrollmentCard)}
        nextSession={
          nextSession ? { ...nextSession, zoom_url: '', recording_media_id: null } : undefined
        }
      />
    </WorkspaceShell>
  );
}
