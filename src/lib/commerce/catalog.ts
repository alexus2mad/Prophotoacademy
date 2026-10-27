import { databasePool, managedDatabase } from '../database/client';
import { paymentMode } from './payment-mode';
import { canTestEnroll, isProduct } from './selectors';
import { canEnroll } from '../format';
import type { Offering } from '../content/types';
import type { EnrollmentOptions, PackageIdRow } from './types';

export async function enrollmentOptions(offering?: Offering): Promise<EnrollmentOptions> {
  const mode = paymentMode();
  if (!offering) return { mode, packageIds: [] };
  if (mode === 'mock')
    return {
      mode,
      packageIds: offering.packages
        .filter((pack) => !isProduct(pack) && canEnroll(offering, pack))
        .map((pack) => pack.id),
    };
  if (!managedDatabase()) return { mode, packageIds: [] };
  const rules = await databasePool().query<PackageIdRow>(
    `SELECT p.package_id,
     (SELECT jsonb_agg(CASE WHEN lesson->>'number' IS NOT NULL
        THEN 'Лекція ' || (lesson->>'number') || ' — ' || (lesson->>'title')
        ELSE lesson->>'title' END)
      FROM jsonb_array_elements(r.manifest->'modules') module,
           jsonb_array_elements(module->'lessons') lesson
      WHERE p.lesson_ids ? (lesson->>'id')) AS lesson_titles
     FROM academy.package_rules p
     JOIN academy.courses c ON c.id=p.course_id
     JOIN academy.releases r ON r.id=p.release_id AND r.course_id=c.id
     WHERE p.offering_id=$1 AND c.program_id=$2 AND c.active_release_id IS NOT NULL
     AND jsonb_array_length(p.lesson_ids)>0`,
    [offering.id, offering.programId],
  );
  return {
    mode,
    lessonTitles: Object.fromEntries(rules.rows.map((r) => [r.package_id, r.lesson_titles || []])),
    packageIds: offering.packages
      .filter((pack) =>
        isProduct(pack)
          ? mode === 'wayforpay' && canEnroll(offering, pack)
          : mode === 'disabled'
            ? rules.rows.some((r) => r.package_id === pack.id) && canTestEnroll(offering, pack)
            : canEnroll(offering, pack),
      )
      .map((p) => p.id),
  };
}
