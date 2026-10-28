'use client';
import { Button } from '@/components/atoms/Button/Button';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { InvitationNotice } from '@/components/molecules/InvitationNotice/InvitationNotice';
import { useAdminTeam } from './hooks';
import type { AdminTeamProps } from './types';

export function AdminTeam(props: AdminTeamProps) {
  const { data } = props;
  const h = useAdminTeam(props);
  return (
    <>
      <div className="workspace-page-heading">
        <h1>Команда Академії</h1>
        <p>
          Адміністратори мають однакові права. Права студії та спільної каси залишаються окремими
        </p>
      </div>
      <div
        className="admin-table-wrap"
        role="region"
        aria-label="Адміністратори Академії"
        tabIndex={0}
      >
        <table className="admin-table admin-team-table" role="table">
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col" role="columnheader">
                Email
              </th>
              <th scope="col" role="columnheader">
                Стан
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {data.members.map((member) => (
              <tr key={member.id} role="row">
                <td role="cell">
                  {member.email}
                  {member.name && <p className="admin-muted">{member.name}</p>}
                </td>
                <td role="cell">Адміністратор</td>
              </tr>
            ))}
            {data.invitations.map((invitation) => (
              <tr key={invitation.email} role="row">
                <td role="cell">{invitation.email}</td>
                <td role="cell">
                  <p className="admin-muted">Права очікують першого входу з підтвердженням email</p>
                  <InvitationNotice
                    email={invitation.email}
                    audience="admin"
                    invitation={invitation.notification}
                    demo={props.demo}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="admin-section admin-panel">
        <h2>Керувати правами</h2>
        <form className="admin-form" onSubmit={h.review}>
          <label>
            Email
            <input
              type="email"
              value={h.change.email}
              onChange={(e) => h.update({ email: e.target.value })}
              required
            />
          </label>
          <label>
            Права
            <select
              value={h.change.grant ? 'grant' : 'revoke'}
              onChange={(e) => h.update({ grant: e.target.value === 'grant' })}
            >
              <option value="grant">Надати права адміністратора</option>
              <option value="revoke">Скасувати права адміністратора</option>
            </select>
          </label>
          <label>
            Причина
            <input
              value={h.change.reason}
              onChange={(e) => h.update({ reason: e.target.value })}
              required
              minLength={3}
              maxLength={1000}
            />
          </label>
          <p className="admin-notice">
            Права можна змінювати протягом 10 хвилин після підтвердження email. Останнього
            адміністратора видалити неможливо. Запрошення містить посилання на вхід. Якщо в людини
            ще немає акаунта, права з’являться лише після підтвердження її email кодом
          </p>
          <button className="button" type="submit" disabled={h.busy}>
            Переглянути зміну
          </button>
          {h.error && (
            <p className="learning-error" role="alert">
              {h.error}
            </p>
          )}
          {h.needsVerification && (
            <a className="button button-secondary" href="/login?reauth=1&next=%2Fadmin%2Fteam">
              Підтвердити мій email
            </a>
          )}
          {h.message && <p role="status">{h.message}</p>}
        </form>
      </section>
      <Dialog
        dialogRef={h.dialogRef}
        closeLabel="Скасувати"
        className="admin-dialog"
        aria-labelledby="team-change-title"
      >
        <h2 id="team-change-title">Підтвердити зміну прав</h2>
        <p>
          {h.change.grant ? 'Надати' : 'Скасувати'} права адміністратора для{' '}
          <strong>{h.change.email.trim().toLowerCase()}</strong>
        </p>
        <p className="admin-muted">{h.change.reason}</p>
        <div className="admin-actions">
          <Button
            className={'button' + (h.change.grant ? '' : ' button-danger')}
            onClick={h.confirm}
            disabled={h.busy}
          >
            Підтвердити
          </Button>
        </div>
      </Dialog>
    </>
  );
}
