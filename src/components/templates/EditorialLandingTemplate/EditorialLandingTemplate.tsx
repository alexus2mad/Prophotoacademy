import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import type { EditorialLandingProps } from './types';
import styles from './EditorialLandingTemplate.module.css';

export function EditorialLandingTemplate({ page }: EditorialLandingProps) {
  return (
    <article className={styles.page}>
      {page.sections.map((section) => {
        const values = Object.fromEntries(section.fields.map((field) => [field.id, field.value]));
        const cover = section.id === 'landing-cover';
        const title = cover ? values.title || page.title : values.heading;
        const text = cover ? values.description : values.text;
        if (!title && !text && !values.image) return null;
        return (
          <section className={styles.section} key={section.id}>
            {title && (cover ? <h1>{title}</h1> : <h2>{title}</h2>)}
            {text?.split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {values.image && (
              <StudioImage
                asset={{ src: values.image, width: 1600, height: 1000 }}
                alt={values.alt || ''}
                sizes="(max-width: 900px) 100vw, 900px"
                preload={cover}
              />
            )}
          </section>
        );
      })}
    </article>
  );
}
