'use client';
import Link from 'next/link';
import { useEmailLogin } from './hooks';
import type { EmailLoginProps } from './types';
export function EmailLogin({ next, configured }: EmailLoginProps) {
  const h = useEmailLogin(next);
  return (
    <section className="email-login">
      <h1>{h.sent ? 'Перевірте вашу пошту' : 'Усе навчання — у вашому кабінеті'}</h1>
      <p>
        {h.sent
          ? `Введіть код, надісланий на ${h.email}`
          : 'Увійдіть за email, який ви вказали під час придбання курсу'}
      </p>
      {configured ? (
        <form onSubmit={h.submit}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={h.email}
            onChange={(e) => h.setEmail(e.target.value)}
            required
            disabled={h.sent || h.busy}
          />
          {h.sent && (
            <>
              <label htmlFor="login-code">Код із листа</label>
              <input
                id="login-code"
                className="otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6,10}"
                maxLength={10}
                value={h.code}
                onChange={(e) => h.setCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
            </>
          )}
          {h.error && (
            <p role="alert" className="form-error">
              {h.error}
            </p>
          )}
          <button className="button" disabled={h.busy} type="submit">
            {h.busy ? 'Зачекайте…' : h.sent ? 'Увійти' : 'Отримати код'}
          </button>
          {h.sent && (
            <div className="login-secondary">
              <button type="button" className="text-link" onClick={h.resend} disabled={h.busy}>
                Надіслати код ще раз
              </button>
              <button type="button" className="text-link" onClick={() => h.setSent(false)}>
                Змінити email
              </button>
            </div>
          )}
        </form>
      ) : (
        <div className="learning-setup-note">
          <p>Кабінет готується до запуску</p>
          <Link href="/demo/account" className="button">
            Переглянути демонстрацію
          </Link>
        </div>
      )}
      <p className="login-privacy">
        Вхід означає згоду з <Link href="/privacy-policy">політикою конфіденційності</Link>
      </p>
    </section>
  );
}
