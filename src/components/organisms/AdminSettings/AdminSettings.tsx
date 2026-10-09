import { cashboxUrl } from '@/lib/commerce/cashbox';
import type { AdminSettingsProps } from './types';
export function AdminSettings({ services }: AdminSettingsProps) {
  return (
    <>
      <div className="workspace-page-heading">
        <h1>Налаштування платформи</h1>
        <p>Підключення сервісів і готовність до запуску</p>
      </div>
      <section className="admin-panel">
        <ul className="admin-list">
          {services.map((service) => (
            <li key={service.name}>
              <div>
                <strong>{service.name}</strong>
                <p>{service.detail}</p>
              </div>
              <span className="admin-badge">
                {service.configured ? 'Налаштовано' : 'Потрібне підключення'}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <p className="admin-muted">
        Наявність конфігурації не замінює перевірку доставки листів, платежів і доступу перед
        запуском
      </p>
      <section className="admin-section admin-panel">
        <h2>Спільна каса</h2>
        <p>
          Звіти та фінансові операції ведуться в ps-booking. Для входу використовується обліковий
          запис тієї системи
        </p>
        <a
          className="button button-secondary"
          href={cashboxUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          Відкрити касу
        </a>
      </section>
    </>
  );
}
