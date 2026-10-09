import { Photo } from '@/components/atoms/Photo/Photo';
import { findImage } from '@/lib/content/selectors';
import Link from 'next/link';
import type { FounderSectionProps } from './types';
export function FounderSection({ content }: FounderSectionProps) {
  return (
    <section className="editorial-section founder-editorial container" data-editorial-reveal>
      <div className="founder-editorial-copy">
        <h2>
          Навчання з досвіду
          <br />
          реальних зйомок
        </h2>
        <div className="founder-biography">
          <h3>Олена Попова</h3>
          <p className="founder-role">
            Рекламна фотографка.
            <br />
            Засновниця Pro Photo Academy.
          </p>
          <p>
            Понад 15 років у професії. Досвід зйомок для брендів — у навчанні, яке допомагає перейти
            від випадкового кадру до впевненої практики.
          </p>
          <Link href="/about-us#team" className="text-link">
            Познайомитися з командою
          </Link>
        </div>
        <div className="founder-stat">
          <strong>3000+</strong>
          <span>випускників академії</span>
        </div>
      </div>
      <figure className="founder-editorial-photo">
        <Photo image={findImage(content, 'founder')} natural />
      </figure>
    </section>
  );
}
