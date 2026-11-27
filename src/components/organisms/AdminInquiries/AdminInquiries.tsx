import type { AdminInquiriesProps } from './types';

const dateFormat = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Kyiv',
});
const deliveryLabel = {
  delivered: 'Надіслано в Telegram',
  pending: 'Очікує надсилання',
  failed: 'Помилка, повторимо',
  local: 'Лише збережено',
  canceled: 'Скасовано',
};
const sourceLabel: Record<string, string> = {
  consultation: 'Форма на сторінці',
  header: 'Шапка сайту',
  'homepage-card': 'Картка на головній',
};

export function AdminInquiries({ inquiries, forwarded }: AdminInquiriesProps) {
  return (
    <>
      <div className="workspace-page-heading">
        <h1>Заявки</h1>
        <p>
          {forwarded
            ? 'Заявки з форм сайту. Кожна також надсилається в Telegram-групу «Реєстрація на курс»'
            : 'Заявки з форм сайту. У цьому середовищі вони лише зберігаються'}
        </p>
      </div>
      {inquiries.length ? (
        <div className="admin-table-wrap" role="region" aria-label="Заявки" tabIndex={0}>
          <table className="admin-table" role="table">
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">
                  Дата
                </th>
                <th scope="col" role="columnheader">
                  Контакт
                </th>
                <th scope="col" role="columnheader">
                  Запит
                </th>
                <th scope="col" role="columnheader">
                  Стан
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} role="row">
                  <td role="cell">
                    <time dateTime={inquiry.createdAt}>
                      {dateFormat.format(new Date(inquiry.createdAt))}
                    </time>
                  </td>
                  <td role="cell">
                    {inquiry.name}
                    <p className="admin-muted">{inquiry.contact}</p>
                  </td>
                  <td role="cell">
                    {inquiry.programTitle || inquiry.topic || 'Загальне питання'}
                    {inquiry.packageName && ` · ${inquiry.packageName}`}
                    {inquiry.message && <p className="admin-muted">{inquiry.message}</p>}
                    <p className="admin-muted">
                      {(inquiry.source && sourceLabel[inquiry.source]) || 'Сайт'}
                      {inquiry.site === 'hub' ? ' · Hub' : ''}
                      {inquiry.marketingUpdates ? ' · погоджується на розсилку' : ''}
                    </p>
                  </td>
                  <td role="cell">{deliveryLabel[inquiry.delivery]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="admin-panel">
          <p>Заявок ще немає.</p>
        </section>
      )}
    </>
  );
}
