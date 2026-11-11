import Link from 'next/link';
import { academyProgramsHref } from '@/lib/navigation/academy';
import type { ReviewUnavailableTemplateProps } from './types';
export function ReviewUnavailableTemplate({ title, description }: ReviewUnavailableTemplateProps) {
  return (
    <div className="container status-panel">
      <h1>{title}</h1>
      <p>{description}</p>
      <Link className="button" href={academyProgramsHref()}>
        До програм
      </Link>
    </div>
  );
}
