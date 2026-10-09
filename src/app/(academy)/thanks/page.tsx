import type { ThanksPageProps } from '@/app/types';
import type { Metadata } from 'next';
import { OrderStatus } from '@/components/organisms/OrderStatus/OrderStatus';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'Статус замовлення',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default async function Thanks({ searchParams }: ThanksPageProps) {
  const { token } = await searchParams;
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    return (
      <div className="container status-panel">
        <h1>Дякуємо за інтерес до академії</h1>
        <p>Перегляньте програми або зв’яжіться з нами, щоб обрати навчання.</p>
        <Link href="/courses" className="button">
          До програм
        </Link>
      </div>
    );
  return <OrderStatus token={token} />;
}
