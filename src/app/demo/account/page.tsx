import { demoMember, demoEnrollment, demoSession } from '@/lib/learning/demo';
import { enrollmentCard } from '@/lib/learning/selectors';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { StudentOverview } from '@/components/organisms/StudentOverview/StudentOverview';
export const metadata = {
  title: 'Демо кабінету · ProPhoto',
  robots: { index: false, follow: false },
};
export default function DemoAccountPage() {
  return (
    <WorkspaceShell member={demoMember} demo>
      <StudentOverview
        name={demoMember.name}
        courses={[enrollmentCard(demoEnrollment)]}
        nextSession={demoSession}
        demo
      />
    </WorkspaceShell>
  );
}
