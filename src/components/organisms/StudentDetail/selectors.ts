import type { Grant } from '@/lib/learning/types';

export const hasCurrentAccess = (grants: Grant[], now = Date.now()) =>
  grants.some(
    (grant) =>
      !grant.revoked_at &&
      grant.lesson_ids.length > 0 &&
      (!grant.expires_at || Date.parse(grant.expires_at) > now),
  );
