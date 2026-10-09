'use client';
import { Button } from '@/components/atoms/Button/Button';
import { money } from '@/lib/format';
import { useOperationsDashboard } from './hooks';

const names: Record<string, string> = {
  'course-enrollment': 'Запис на курс',
  'course-completed': 'Курс завершено',
  'practice-purchased': 'Придбано практику',
  'practice-completed': 'Практику завершено',
  'studio-booking': 'Бронювання студії',
};
export function OperationsDashboard() {
  const { data, setData, error, busy, load } = useOperationsDashboard();
  return (
    <>
      <h1>Клієнти ProPhoto</h1>
      <p className="muted">Спільний огляд навчання, практики та студійних бронювань</p>
      {!data ? (
        <form className="form-stack operations-login" onSubmit={load}>
          <label>
            Ключ доступу команди
            <input name="token" type="password" required minLength={32} autoComplete="off" />
          </label>
          <Button type="submit" className="button" disabled={busy}>
            {busy ? 'Завантажуємо…' : 'Відкрити огляд'}
          </Button>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
        </form>
      ) : (
        <>
          <div className="operations-metrics">
            {[
              ['Записи на курси', data.metrics.enrollments],
              ['Бронювання студії', data.metrics.studioBookings],
              ['Покупки практики', data.metrics.practicePurchases],
              ['Повторні клієнти студії', data.metrics.repeatStudioCustomers],
              ['Від практики до студії', data.metrics.practiceToStudioCustomers],
              ['Підтверджений дохід', money(data.metrics.revenue)],
              [
                'Маржинальний дохід',
                data.metrics.contributionMargin === null
                  ? 'Потрібні дані про витрати'
                  : money(data.metrics.contributionMargin),
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="operations-note">
            Лише підтверджені записи. Демоплатежі виключено. Конверсії звіряйте з аналітикою;
            маржинальний дохід доступний після внесення витрат.
          </p>
          <div className="customer-records">
            {data.customers.map((customer) => (
              <article key={customer.id}>
                <h2>{customer.name}</h2>
                <p>{customer.contacts.join(' · ')}</p>
                <p className="muted">
                  Інтереси: {customer.interests.join(', ') || 'Не зазначено'} · Місто:{' '}
                  {customer.locality === 'kyiv'
                    ? 'Київ'
                    : customer.locality === 'other'
                      ? 'Поза Києвом'
                      : 'Не зазначено'}{' '}
                  · Анонси: {customer.marketingUpdates ? 'Дозволені' : 'Без підписки'}
                </p>
                {!!customer.acquisition && (
                  <p className="muted">
                    Джерело:{' '}
                    {[
                      customer.acquisition.utmSource ||
                        customer.acquisition.fromSite ||
                        'Прямий перехід',
                      customer.acquisition.utmCampaign,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
                <ul>
                  {customer.activity.map((activity) => (
                    <li key={activity.source + activity.id}>
                      {names[activity.kind]}
                      {activity.productTitle ? ' · ' + activity.productTitle : ''} ·{' '}
                      {activity.status === 'completed'
                        ? 'Підтверджено'
                        : activity.status === 'canceled'
                          ? 'Скасовано'
                          : 'Повернено'}{' '}
                      ·{' '}
                      {new Intl.DateTimeFormat('uk-UA', {
                        dateStyle: 'medium',
                        timeZone: 'Europe/Kyiv',
                      }).format(new Date(activity.occurredAt))}
                    </li>
                  ))}
                </ul>
                {customer.nextAction && (
                  <a className="text-link" href={customer.nextAction.href}>
                    Наступний крок: {customer.nextAction.label}
                  </a>
                )}
              </article>
            ))}
          </div>
          <Button className="text-link" onClick={() => setData(undefined)}>
            Закрити огляд
          </Button>
        </>
      )}
    </>
  );
}
