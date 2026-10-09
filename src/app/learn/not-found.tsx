import Link from 'next/link';

export default function LessonUnavailable() {
  return (
    <main id="main" className="workspace-empty">
      <h1>Урок недоступний</h1>
      <p>Перевірте доступ до курсу у своєму кабінеті або зверніться до академії</p>
      <Link className="button" href="/account">
        До моїх курсів
      </Link>
      <Link className="button button-secondary" href="/contacts">
        Зв’язатися з академією
      </Link>
    </main>
  );
}
