import type { EnrollmentScopeProps } from './types';

export function EnrollmentScope({ lessons }: EnrollmentScopeProps) {
  if (!lessons.length) return null;
  return (
    <div className="enrollment-scope">
      <p>
        <strong>Зараз у тестовому доступі</strong>
      </p>
      <ul>
        {lessons.map((title, index) => (
          <li key={index}>{title}</li>
        ))}
      </ul>
      <p>Доступ надається лише до перелічених уроків</p>
    </div>
  );
}
