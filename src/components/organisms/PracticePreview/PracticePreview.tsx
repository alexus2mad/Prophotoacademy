import { Photo } from '@/components/atoms/Photo/Photo';
import { findImage } from '@/lib/content/selectors';
import { readyPractice, siteHref } from '@/lib/ecosystem';
import Link from 'next/link';
import type { PracticePreviewProps } from './types';
export function PracticePreview({ content, programId, compact = false }: PracticePreviewProps) {
  const session = content.practiceSessions.find(
    (s) => s.status !== 'paused' && (!programId || s.programIds.includes(programId)),
  );
  if (!session) return null;
  return (
    <section
      className={`practice-preview ${compact ? 'practice-preview--compact' : ''}`}
      aria-label="Практика в Києві"
    >
      <div className="practice-preview-photo">
        <Photo image={findImage(content, session.imageId)} />
      </div>
      <div>
        <p className="practice-location">Офлайн · Київ</p>
        <h2>
          {compact ? 'Від знань до власної зйомки' : 'Навчайтеся онлайн — практикуйтеся в Києві'}
        </h2>
        <p>{session.description}</p>
        {!readyPractice(session) && (
          <p className="practice-stage">Готуємо формат · дата й вартість після підтвердження</p>
        )}
        <Link
          href={siteHref('hub', session.slug)}
          className="text-link"
          data-ecosystem-target="hub"
          data-offer="guided-practice"
        >
          {readyPractice(session) ? 'Переглянути практику' : 'Про практику в Hub'}
        </Link>
      </div>
    </section>
  );
}
