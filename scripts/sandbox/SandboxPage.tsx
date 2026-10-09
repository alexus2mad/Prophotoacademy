import Link from 'next/link';
export default function SandboxPage() {
  return (
    <main id="main" className="learning-app workspace-content">
      <div className="workspace-page-heading">
        <h1>Тестовий навчальний простір</h1>
        <p>Локальні дані зберігаються між запусками · оплата й листи вимкнені</p>
      </div>
      <div className="admin-grid">
        <section className="admin-panel">
          <h2>Менеджер</h2>
          <p>manager@example.test</p>
          <p>
            Код входу: <strong>123456</strong>
          </p>
          <Link className="button" href="/login?next=/admin/courses">
            Створити й редагувати курс
          </Link>
          <p>
            <a href="http://127.0.0.1:3201/academy.html" target="_blank" rel="noreferrer">
              Студенти та доступ у ps-booking
            </a>
          </p>
        </section>
        <section className="admin-panel">
          <h2>Студент</h2>
          <p>student@example.test</p>
          <p>
            Код входу: <strong>123456</strong>
          </p>
          <Link className="button" href="/login?next=/account">
            Відкрити кабінет студента
          </Link>
          <p>Курс з’явиться після надання доступу менеджером</p>
        </section>
      </div>
      <section className="admin-section admin-panel">
        <h2>Сценарій перевірки</h2>
        <ol>
          <li>Створіть чернетку програми «Тестова контент-практика»</li>
          <li>Додайте текст, відео, фото або PDF, збережіть і опублікуйте</li>
          <li>У ps-booking надайте student@example.test доступ до потрібних уроків</li>
          <li>Увійдіть студентом, пройдіть урок і перевірте збережений прогрес</li>
          <li>Скасуйте й відновіть доступ у ps-booking</li>
        </ol>
        <p>
          Це перевірка інтерфейсів і бізнес-правил. Email, Sanity, Mux і сховище замінено локальними
          тестовими адаптерами. Код 123456 працює лише тут
        </p>
      </section>
    </main>
  );
}
