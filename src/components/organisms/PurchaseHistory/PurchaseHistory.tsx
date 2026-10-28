import { formatMoney, purchaseStatus } from '@/lib/commerce/format';
import { displayDate } from '@/lib/learning/selectors';
import type { PurchaseHistoryProps } from './types';
export function PurchaseHistory({ purchases }: PurchaseHistoryProps) {
  return purchases.length ? (
    <ul className="purchase-history" aria-label="Історія покупок">
      {purchases.map((order) => (
        <li key={order.id} className="purchase-history-item">
          <div className="purchase-history-course">
            <h2>{order.title}</h2>
            <p className="purchase-history-package">{order.packageName}</p>
          </div>
          <dl className="purchase-history-details">
            <div className="purchase-history-date">
              <dt>Дата</dt>
              <dd>
                <time dateTime={order.createdAt}>{displayDate(order.createdAt)}</time>
              </dd>
            </div>
            <div className="purchase-history-amount">
              <dt>Сума</dt>
              <dd>{formatMoney(order.amount, order.currency)}</dd>
            </div>
            <div className="purchase-history-status">
              <dt>Стан</dt>
              <dd data-status={order.status}>{purchaseStatus(order.status)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  ) : (
    <div className="purchase-history-empty">
      <p>Покупок за цим email поки немає</p>
    </div>
  );
}
