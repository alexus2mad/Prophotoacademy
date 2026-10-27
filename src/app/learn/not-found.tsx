import Link from 'next/link';
import { academyThemeClassName } from '@/lib/typography/fonts';

export default function LessonUnavailable() {
  return (
    <main id="main" className={`learning-app learning-unavailable ${academyThemeClassName}`}>
      <div className="workspace-empty">
        <h1>Урок недоступний</h1>
        <p>Перевірте доступ до курсу у своєму кабінеті або зверніться до академії</p>
        <div className="admin-actions">
          <Link className="button" href="/account">
            До моїх курсів
          </Link>
          <Link className="button button-secondary" href="/contacts">
            Зв’язатися з академією
          </Link>
        </div>
      </div>
    </main>
  );
}
