'use client';
import Link from 'next/link';
import { useAdminCourses } from './hooks';
import type { AdminCoursesProps } from './types';
export function AdminCourses({ data, demo = false }: AdminCoursesProps) {
  const h = useAdminCourses(demo);
  const available = data.programs.filter((p) => !data.courses.some((c) => c.program_id === p.id));
  return (
    <>
      <div className="workspace-page-heading">
        <h1>Курси</h1>
        <p>Матеріали, пакети доступу й розклад зустрічей</p>
      </div>
      <div className="admin-grid">
        {data.courses.map((c) => (
          <Link
            className="admin-panel"
            key={c.id}
            href={(demo ? '/demo' : '') + '/admin/courses/' + c.id}
          >
            <span className="admin-badge">{c.active_release_id ? 'Опубліковано' : 'Чернетка'}</span>
            <h2 style={{ marginTop: 24 }}>{c.title}</h2>
            <p>Програма та матеріали</p>
          </Link>
        ))}
      </div>
      {available.length > 0 && (
        <section className="admin-section admin-panel">
          <h2>Додати навчальні матеріали до програми</h2>
          <form className="admin-form" onSubmit={h.create}>
            <label>
              Програма
              <select value={h.program} onChange={(e) => h.setProgram(e.target.value)} required>
                <option value="">Оберіть програму</option>
                {available.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <button className="button" type="submit" disabled={h.busy}>
                Створити чернетку
              </button>
            </div>
            <p className="admin-muted">
              Публічна програма стане основою структури. Навчальні матеріали потрібно додати й
              опублікувати окремо
            </p>
            {h.error && (
              <p className="learning-error" role="alert">
                {h.error}
              </p>
            )}
            {h.message && <p role="status">{h.message}</p>}
          </form>
        </section>
      )}
    </>
  );
}
