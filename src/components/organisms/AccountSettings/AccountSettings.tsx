'use client';
import { useAccountSettings } from './hooks';
import type { AccountSettingsProps } from './types';
export function AccountSettings(props: AccountSettingsProps) {
  const h = useAccountSettings(props);
  return (
    <form
      className="account-settings"
      aria-labelledby="account-settings-title"
      aria-busy={h.busy}
      onSubmit={h.save}
    >
      <header className="account-settings-heading">
        <h2 id="account-settings-title">Особисті дані</h2>
      </header>
      <div className="account-settings-fields">
        <div className="account-settings-field">
          <label htmlFor="account-name">Ваше ім’я</label>
          <input
            id="account-name"
            name="name"
            value={h.name}
            onChange={(e) => h.setName(e.target.value)}
            autoComplete="name"
            minLength={2}
            maxLength={80}
            required
          />
        </div>
        <div className="account-settings-field">
          <label htmlFor="account-email">Email</label>
          <input
            id="account-email"
            name="email"
            value={props.member.email}
            type="email"
            autoComplete="email"
            aria-describedby="account-email-help"
            readOnly
          />
          <p id="account-email-help" className="account-settings-help">
            За цим email зберігаються ваші покупки й доступ до курсів. Щоб перенести доступ,
            зверніться до академії
          </p>
        </div>
      </div>
      <div className="account-settings-actions">
        <button className="button" type="submit" disabled={h.busy}>
          {h.busy ? 'Зберігаємо…' : 'Зберегти'}
        </button>
        <p className="account-settings-status" role="status" aria-atomic="true">
          {h.message}
        </p>
      </div>
    </form>
  );
}
