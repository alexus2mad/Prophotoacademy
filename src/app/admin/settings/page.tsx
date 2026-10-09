import { pageMember } from '@/lib/auth/server';
import { WorkspaceShell } from '@/components/templates/WorkspaceShell/WorkspaceShell';
import { AdminSettings } from '@/components/organisms/AdminSettings/AdminSettings';
export default async function Settings() {
  const member = await pageMember('/admin/settings', true);
  const services = [
    {
      name: 'Supabase',
      configured: !!process.env.DATABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      detail: 'Облікові записи, прогрес і захищені файли',
    },
    {
      name: 'Sanity Learning',
      configured: !!process.env.SANITY_LEARNING_WRITE_TOKEN,
      detail: 'Окремий приватний простір навчальних матеріалів',
    },
    {
      name: 'Mux',
      configured: !!process.env.MUX_TOKEN_SECRET && !!process.env.MUX_PRIVATE_KEY,
      detail: 'Обробка й захищене відтворення відео',
    },
    {
      name: 'Resend',
      configured: !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM,
      detail: 'Листи про доступ до курсів',
    },
    {
      name: 'ps-booking',
      configured: !!process.env.PS_BOOKING_MANAGEMENT_SECRET,
      detail: 'Керування студентами, правами й навчальною статистикою',
    },
  ];
  return (
    <WorkspaceShell member={member} section="settings" admin>
      <AdminSettings services={services} />
    </WorkspaceShell>
  );
}
