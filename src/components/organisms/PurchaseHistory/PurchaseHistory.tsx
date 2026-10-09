import { formatMoney, purchaseStatus } from '@/lib/commerce/format';
import { displayDate } from '@/lib/learning/selectors';
import type { PurchaseHistoryProps } from './types';
export function PurchaseHistory({ purchases }: PurchaseHistoryProps) {
  return purchases.length ? (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Програма</th>
            <th scope="col">Дата</th>
            <th scope="col">Сума</th>
            <th scope="col">Стан</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((order) => (
            <tr key={order.id}>
              <td>
                {order.title}
                <p className="admin-muted">{order.packageName}</p>
              </td>
              <td>{displayDate(order.createdAt)}</td>
              <td>{formatMoney(order.amount, order.currency)}</td>
              <td>{purchaseStatus(order.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="admin-notice">Покупок за цим email поки немає</p>
  );
}
