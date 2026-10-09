import type { Metadata } from 'next';
import { OperationsDashboard } from '@/components/organisms/OperationsDashboard/OperationsDashboard';
export const metadata: Metadata = {
  title: 'ProPhoto · команда',
  robots: { index: false, follow: false },
};
export default function Operations() {
  return (
    <main id="main" className="container operations-page">
      <OperationsDashboard />
    </main>
  );
}
