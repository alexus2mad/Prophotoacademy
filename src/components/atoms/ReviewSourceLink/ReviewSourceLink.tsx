import Link from 'next/link';
import { originalReviewSource } from '@/lib/studio-reviews/source';
import type { ReviewSourceLinkProps } from './types';

export function ReviewSourceLink({ source, className, indexLabel }: ReviewSourceLinkProps) {
  const original = originalReviewSource(source);
  if (original)
    return (
      <a className={className} href={original} target="_blank" rel="noreferrer">
        Переглянути оригінал
      </a>
    );
  return indexLabel ? (
    <Link className={className} href="/reviews">
      {indexLabel}
    </Link>
  ) : null;
}
