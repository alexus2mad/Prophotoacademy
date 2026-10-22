import { Photo } from '@/components/atoms/Photo/Photo';
import { findImage } from '@/lib/content/selectors';
import Link from 'next/link';
import type { PhotographyManifestoProps } from './types';
export function PhotographyManifesto({ content }: PhotographyManifestoProps) {
  const portrait =
    content.images.find((image) => image.id === 'editorial-portrait') ||
    findImage(content, 'founder');
  return (
    <section className="photography-manifesto" aria-labelledby="manifesto-title">
      <div className="container manifesto-composition">
        <p className="eyebrow">Фотографія починається з погляду</p>
        <h2 id="manifesto-title">
          Не просто
          <br />
          дивитися
          <br />
          <em>Відчувати</em>
        </h2>
        <figure>
          <Photo image={portrait} sizes="(max-width: 767px) 85vw, 45vw" />
          <figcaption>Олена Попова · портретна фотографія</figcaption>
        </figure>
        <div className="manifesto-copy">
          <p>
            Помічати світло. Знаходити ритм. Перетворювати звичайні речі на образи, від яких не
            відвести очей.
          </p>
          <p>Ми ділимося досвідом реальних зйомок — щоб ти міг створювати такі кадри свідомо.</p>
          <Link href="/about-us" className="text-link">
            Знайомся з академією
          </Link>
        </div>
      </div>
    </section>
  );
}
