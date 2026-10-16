import type { CheckoutPageProps } from '@/app/types';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent, findImage } from '@/lib/content';
import { resolvePurchase } from '@/lib/checkout';
import { money } from '@/lib/format';
import { CheckoutForm } from '@/components/organisms/CheckoutForm/CheckoutForm';
import { Photo } from '@/components/atoms/Photo/Photo';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { paymentMode } from '@/lib/commerce/payment-mode';
import { isProduct } from '@/lib/commerce/selectors';
import { purchaseAccess } from '@/lib/commerce/orders';
import { currentMember } from '@/lib/auth/server';
import { enrollmentOptions } from '@/lib/commerce/catalog';
import { EnrollmentScope } from '@/components/molecules/EnrollmentScope/EnrollmentScope';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Оформлення замовлення',
  robots: { index: false, follow: false },
};
export default async function Checkout({ searchParams }: CheckoutPageProps) {
  const query = await searchParams;
  const content = await getContent();
  const mode = paymentMode();
  const member = await currentMember();
  let purchase;
  try {
    purchase = resolvePurchase(
      content,
      query.demo === '1' ? 'demo-offering' : query.offering || '',
      query.demo === '1' ? 'demo-base' : query.package || '',
    );
    if (mode !== 'mock' && !isProduct(purchase.pack))
      await purchaseAccess(purchase.offering.id, purchase.pack.id, purchase.program.id);
  } catch {
    return (
      <div className="container status-panel">
        <h1>Уточнімо ваш набір</h1>
        <p>
          Цей пакет ще готується до запису. Команда підтвердить доступність навчальних матеріалів і
          деталі набору.
        </p>
        <InquiryButton className="button">Зв’язатися з академією</InquiryButton>
        <Link href="/courses" className="text-link">
          Повернутися до програм
        </Link>
      </div>
    );
  }
  const { program, offering, pack } = purchase;
  const product = isProduct(pack);
  const scope =
    mode === 'disabled' ? (await enrollmentOptions(offering)).lessonTitles?.[pack.id] : undefined;
  return (
    <div className="container">
      <div className="page-heading">
        <h1>
          {query.demo === '1'
            ? 'Перевірка оформлення'
            : product
              ? 'Оформлення замовлення'
              : 'Оформлення навчання'}
        </h1>
        <p className="muted">
          {product
            ? 'Залиште контакти — підтвердження надійде на email, а команда академії зв’яжеться з вами щодо деталей.'
            : 'Вкажіть email, з яким навчатиметеся. Доступ з’явиться у вашому кабінеті.'}
        </p>
      </div>
      <div className="checkout-grid">
        <CheckoutForm
          offeringId={offering.id}
          packageId={pack.id}
          mode={mode}
          kind={pack.kind}
          email={member?.email}
          name={member?.name}
        />
        <aside className="checkout-summary">
          <div className="checkout-summary-heading">
            <Photo image={findImage(content, program.imageId)} />
            <div>
              <p className="eyebrow">{pack.name}</p>
              <h2>{program.shortTitle}</h2>
            </div>
          </div>
          <div className="price">{money(mode === 'disabled' ? 0 : pack.price)}</div>
          <p className="muted">
            {mode === 'disabled'
              ? `Звичайна вартість пакета — ${money(pack.price)}`
              : 'Разова оплата'}
          </p>
          {mode === 'disabled' && (
            <p className="checkout-notice">
              Оплату тимчасово вимкнено. Доступ надається одразу після запису. Дані картки не
              потрібні, майбутнього списання не буде.
            </p>
          )}
          {!!pack.includes.length && (
            <details className="checkout-includes">
              <summary>Що входить у пакет</summary>
              <ul className="check-list">
                {pack.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          )}
          {scope && <EnrollmentScope lessons={scope} />}
        </aside>
      </div>
    </div>
  );
}
