'use client';
import { useAccountSettings } from './hooks';
import type { AccountSettingsProps } from './types';
export function AccountSettings(props: AccountSettingsProps) {
  const h = useAccountSettings(props);
  return (
    <form className="admin-form" onSubmit={h.save}>
      <label>
        Ваше ім’я
        <input
          value={h.name}
          onChange={(e) => h.setName(e.target.value)}
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
        />
      </label>
      <label>
        Email
        <input value={props.member.email} type="email" readOnly />
      </label>
      <p className="admin-muted">
        За цим email зберігаються ваші покупки й доступ до курсів. Щоб перенести доступ, зверніться
        до академії
      </p>
      <div>
        <button className="button" type="submit" disabled={h.busy}>
          {h.busy ? 'Зберігаємо…' : 'Зберегти'}
        </button>
      </div>
      {h.message && <p role="status">{h.message}</p>}
    </form>
  );
}
