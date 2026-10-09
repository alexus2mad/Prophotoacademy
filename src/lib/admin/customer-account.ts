import type { SqlConnection } from '../database/types';
import type { Member } from '../auth/types';
import type { CustomerAcademyAccount, CustomerAccessRow } from './types';

/** A narrow CRM read model: verified accounts and usable grants, never lesson content. */
export async function customerAccounts(
  db: SqlConnection,
  emails: string[],
): Promise<CustomerAcademyAccount[]> {
  const profiles = await db.query<Pick<Member, 'id' | 'email'>>(
    'SELECT id,email FROM academy.profiles WHERE email=ANY($1::text[]) ORDER BY email',
    [emails],
  );
  const grants = await db.query<CustomerAccessRow>(
    `SELECT g.id,g.user_id,g.email,g.course_id,c.title,g.package_name,g.starts_at,g.expires_at
     FROM academy.grants g JOIN academy.courses c ON c.id=g.course_id
     WHERE (g.user_id=ANY($1::uuid[]) OR (g.user_id IS NULL AND g.email=ANY($2::text[])))
       AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>now())
       AND jsonb_array_length(g.lesson_ids)>0
     ORDER BY c.title,g.starts_at,g.id`,
    [profiles.rows.map((p) => p.id), emails],
  );
  return [...new Set(emails)].map((email) => {
    const profile = profiles.rows.find((p) => p.email === email);
    const eligible = grants.rows.filter((g) =>
      profile ? g.user_id === profile.id : !g.user_id && g.email === email,
    );
    const courses: CustomerAcademyAccount['courses'] = [];
    for (const grant of eligible) {
      let course = courses.find((c) => c.id === grant.course_id);
      if (!course) {
        course = { id: grant.course_id, title: grant.title, access: [] };
        courses.push(course);
      }
      course.access.push({
        packageName: grant.package_name,
        startsAt: new Date(grant.starts_at).toISOString(),
        expiresAt: grant.expires_at ? new Date(grant.expires_at).toISOString() : null,
      });
    }
    return { userId: profile?.id || null, email, hasAccount: Boolean(profile), courses };
  });
}
