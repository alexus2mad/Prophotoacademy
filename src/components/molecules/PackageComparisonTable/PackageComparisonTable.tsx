import { money } from '@/lib/format';
import { packageComparisonDimensions, packageComparisonFact } from '@/lib/packages/selectors';
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
          {items.map((pack) => (
            <th scope="col" key={pack.id} data-featured={pack.featured || undefined}>
              {pack.name}
              {pack.featured && <span className="package-popularity">Найпопулярніший</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Вартість</th>
          {items.map((pack) => (
            <td key={pack.id} data-featured={pack.featured || undefined}>
              <strong className="comparison-price">{money(pack.price)}</strong>
            </td>
          ))}
        </tr>
        <tr>
          <th scope="row">Для кого</th>
          {items.map((pack) => (
            <td key={pack.id} data-featured={pack.featured || undefined}>
              {pack.description}
            </td>
          ))}
        </tr>
        {packageComparisonDimensions.map((dimension) => (
          <tr key={dimension.id}>
            <th scope="row">{dimension.label}</th>
            {items.map((pack) => {
              const fact = packageComparisonFact(pack, dimension.id);
              return (
                <td
                  key={pack.id}
                  data-featured={pack.featured || undefined}
                  data-state={fact.state}
                >
                  <span className="comparison-fact-state">{fact.label}</span>
                  {fact.text && <p>{fact.text}</p>}
                </td>
              );
            })}
          </tr>
        ))}
        <tr>
          <th scope="row">Наявність</th>
          {items.map((pack) => (
            <td key={pack.id} data-featured={pack.featured || undefined}>
              <span className="comparison-status">{pack.statusLabel}</span>
            </td>
          ))}
        </tr>
        <tr>
          <th scope="row">
            <span className="sr-only">Запис</span>
          </th>
          {items.map((pack) => (
            <td key={pack.id} data-featured={pack.featured || undefined}>
              {pack.purchaseUrl && !pack.inquiryOnly ? (
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
                  type="button"
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
