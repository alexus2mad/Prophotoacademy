import Link from 'next/link';
export function SandboxBanner() {
  return (
    <aside
      style={{
        padding: '10px 20px',
        background: '#D5E4B9',
        color: '#101211',
        fontSize: 14,
        position: 'relative',
        zIndex: 60,
      }}
      aria-label="Локальна тестова версія"
    >
      <strong>Локальний тест · оплата вимкнена</strong>
      {' · '}
      <Link href="/sandbox" style={{ color: 'inherit', textDecoration: 'underline' }}>
        Сценарій і тестові акаунти
      </Link>
    </aside>
  );
}
