'use client';
import { useStudioBooking } from './hooks';
import type { StudioBookingProps } from './types';

export function StudioBooking({ providerUrl, roomKey, roomTitle, phone }: StudioBookingProps) {
  const { loaded, setLoaded, url } = useStudioBooking({ providerUrl, roomKey, roomTitle, phone });
  if (process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages')
    return (
      <>
        <div className="booking-top">
          <h1>{roomTitle ? `Бронювання · ${roomTitle}` : 'Сплануйте свою зйомку'}</h1>
        </div>
        <section className="status-panel">
          <h2>Бронювання на сайті студії</h2>
          <p>
            GitHub-версія показує дизайн і простори. Актуальний календар та оформлення бронювання
            доступні на основному сайті ProPhoto Hub.
          </p>
          <a
            className="button"
            href={
              'https://www.prophotohub.com.ua/booking' +
              (roomKey ? '?room=' + encodeURIComponent(roomKey) : '')
            }
            target="_blank"
            rel="noreferrer"
          >
            Відкрити сайт студії
          </a>
        </section>
      </>
    );
  return (
    <>
      <div className="booking-top">
        <h1>{roomTitle ? `Бронювання · ${roomTitle}` : 'Сплануйте свою зйомку'}</h1>
        <a href={url.href} className="text-link" target="_blank" rel="noreferrer">
          Відкрити календар окремо
        </a>
      </div>
      {!loaded && (
        <p className="muted" role="status">
          Завантажуємо календар студії…
        </p>
      )}
      <iframe
        className="studio-booking-frame"
        src={url.href}
        title="Онлайн-бронювання ProPhoto Hub"
        onLoad={() => setLoaded(true)}
        allow="payment"
      />
      <p className="booking-support">
        Потрібна допомога з бронюванням? <a href={`tel:${phone}`}>Зателефонуйте команді студії</a>
      </p>
    </>
  );
}
