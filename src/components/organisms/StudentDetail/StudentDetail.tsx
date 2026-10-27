'use client';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button/Button';
import { LearningProgress } from '@/components/atoms/LearningProgress/LearningProgress';
import { AccessDialog } from '@/components/organisms/AccessDialog/AccessDialog';
import { money } from '@/lib/format';
import { useStudentDetail } from './hooks';
import type { StudentDetailProps } from './types';

const day = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Kyiv',
});
const purchaseStatus: Record<string, string> = {
  approved: 'Оплачено',
  enrolled: 'Тестовий запис без оплати',
  pending: 'Очікує оплати',
  refunded: 'Оплату повернено',
  declined: 'Відхилено',
  canceled: 'Скасовано',
};
const confirmation: Record<string, string> = {
  automatic: 'Автоматично',
  student: 'Студент',
  admin: 'Викладач',
  quiz: 'Тест',
};

export function StudentDetail({ detail, demo }: StudentDetailProps) {
  const h = useStudentDetail();
  const base = demo ? '/demo/admin/students' : '/admin/students';
  return (
    <>
      <p>
        <Link className="text-link" href={base}>
          До списку студентів
        </Link>
      </p>
      <div className="workspace-page-heading">
        <div>
          <h1>{detail.profile?.name || detail.email}</h1>
          <p>
            {detail.email}
            {detail.profile ? '' : ' · акаунт ще не створено, доступ чекає підтвердження email'}
          </p>
        </div>
        <Button className="button" onClick={() => h.openAccess('grant')}>
          Надати доступ до курсу
        </Button>
      </div>
      <section className="admin-section">
        <h2>Курси й навчальний прогрес</h2>
        {detail.grants.length ? (
          <ul className="admin-list student-grants">
            {detail.grants.map((grant) => {
              const release = detail.courses.find((c) => c.id === grant.release_id);
              const stats = detail.learning?.find((s) => s.grantId === grant.id);
              return (
                <li key={grant.id}>
                  <div>
                    <strong>{release?.manifest.title || grant.course_id}</strong>
                    <p>
                      {grant.package_name} ·{' '}
                      {grant.revoked_at
                        ? 'Доступ скасовано'
                        : grant.expires_at
                          ? 'До ' + day.format(new Date(grant.expires_at))
                          : 'Безстроково'}
                    </p>
                    {stats && (
                      <>
                        <LearningProgress
                          value={stats.progress}
                          label={`${stats.completed} із ${stats.total} уроків завершено`}
                        />
                        <details>
                          <summary>Прогрес уроків</summary>
                          <div
                            className="admin-table-wrap"
                            role="region"
                            aria-label={
                              'Прогрес уроків — ' + (release?.manifest.title || grant.course_id)
                            }
                            tabIndex={0}
                          >
                            <table className="admin-table">
                              <thead>
                                <tr>
                                  <th>Урок</th>
                                  <th>Прогрес</th>
                                  <th>Підтвердження</th>
                                </tr>
                              </thead>
                              <tbody>
                                {stats.lessons.map((lesson) => (
                                  <tr key={lesson.id}>
                                    <td>{lesson.title}</td>
                                    <td>{Math.round(lesson.progress * 100)}%</td>
                                    <td>{(lesson.source && confirmation[lesson.source]) || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </details>
                      </>
                    )}
                  </div>
                  <div className="admin-actions">
                    <Button
                      className="button button-secondary"
                      onClick={() => h.openAccess('extend', grant)}
                    >
                      Змінити доступ
                    </Button>
                    <Button
                      className={
                        'button button-secondary' + (grant.revoked_at ? '' : ' button-danger')
                      }
                      onClick={() => h.openAccess(grant.revoked_at ? 'restore' : 'revoke', grant)}
                    >
                      {grant.revoked_at ? 'Відновити' : 'Скасувати'}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="admin-muted">Доступів до курсів поки немає</p>
        )}
      </section>
      <section className="admin-section">
        <h2>Покупки</h2>
        {detail.purchases.length ? (
          <div
            className="admin-table-wrap"
            role="region"
            aria-label="Покупки студента"
            tabIndex={0}
          >
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Курс / пакет</th>
                  <th>Дата</th>
                  <th>Сума</th>
                  <th>Стан</th>
                </tr>
              </thead>
              <tbody>
                {detail.purchases.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.title} / {p.packageName}
                    </td>
                    <td>{day.format(new Date(p.createdAt))}</td>
                    <td>{money(p.amount / 100)}</td>
                    <td>{purchaseStatus[p.status] || p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-muted">Покупок немає</p>
        )}
        <p className="admin-notice">
          Це історія покупок студента. Загальні фінансові звіти ведуться у спільній касі. Зміна
          доступу не повертає гроші
        </p>
      </section>
      {h.editing && (
        <AccessDialog
          key={h.editing.key}
          dialogRef={h.dialogRef}
          email={detail.email}
          courses={detail.courses}
          grant={h.editing.grant}
          initialAction={h.editing.action}
          demo={demo}
          onSaved={h.saved}
        />
      )}
    </>
  );
}
