import { money } from '@/lib/format';
import Link from 'next/link';
import type { PackageComparisonTableProps } from './types';
export function PackageComparisonTable({
  items,
  programTitle,
  onClose,
  onInquire,
}: PackageComparisonTableProps) {
  return (
    <table className="comparison-table">
      <caption className="sr-only">Порівняння пакетів програми {programTitle}</caption>
      <thead>
        <tr>
          <td />
          <>
            {items.map((pack) => (
              <th scope="col" key={pack.id}>
                {pack.name}
              </th>
            ))}
          </>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Вартість</th>
          {items.map((pack) => (
            <td key={pack.id}>
              <strong className="comparison-price">{money(pack.price)}</strong>
            </td>
          ))}
        </tr>
        <tr>
          <th scope="row">Формат підтримки</th>
          {items.map((pack) => (
            <td key={pack.id}>{pack.description}</td>
          ))}
        </tr>
        <tr>
          <th scope="row">Що входить</th>
          {items.map((pack) => (
            <td key={pack.id}>
              <ul>
                {pack.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </td>
          ))}
        </tr>
        <tr>
          <th scope="row">Наявність</th>
          {items.map((pack) => (
            <td key={pack.id}>
              <span className="comparison-status">{pack.statusLabel}</span>
            </td>
          ))}
        </tr>
        <tr>
          <th scope="row">
            <span className="sr-only">Запис</span>
          </th>
          {items.map((pack) => (
            <td key={pack.id}>
              {pack.purchaseUrl ? (
                <Link
                  className="text-link"
                  href={pack.purchaseUrl}
                  onClick={() => onClose()}
                  aria-label={`Обрати ${pack.name}`}
                >
                  Обрати
                </Link>
              ) : pack.inquiryAllowed ? (
                <button
                  className="text-link"
                  onClick={() => onInquire(pack)}
                  aria-label={`Уточнити ${pack.name}`}
                >
                  Уточнити
                </button>
              ) : (
                <span className="muted">Набір завершено</span>
              )}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
