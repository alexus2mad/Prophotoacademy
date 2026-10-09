import { demoMember } from '@/lib/learning/demo';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminSettings } from '@/components/organisms/AdminSettings/AdminSettings';
export default function Settings() {
  return (
    <WorkspaceShell member={demoMember} admin demo section="settings">
      <AdminSettings
        services={['Supabase', 'Sanity Learning', 'Mux', 'Resend', 'ps-booking'].map((name) => ({
          name,
          configured: false,
          detail: 'У демонстрації використано лише синтетичні дані',
        }))}
      />
    </WorkspaceShell>
  );
}
