'use client';
import { useStudentLookup } from './hooks';
import type { StudentLookupProps } from './types';

export function StudentLookup(props: StudentLookupProps) {
  const h = useStudentLookup(props);
  return (
    <form className="admin-search" onSubmit={h.open}>
      <label>
        Надати доступ за email
        <input
          type="email"
          value={h.email}
          onChange={(e) => h.setEmail(e.target.value)}
          placeholder="student@example.com"
          required
        />
      </label>
      <button className="button button-secondary" type="submit">
        Відкрити
      </button>
    </form>
  );
}
