import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import type { StudioProgramFacultyProps } from './types';
import styles from './StudioProgramFaculty.module.css';

export function StudioProgramFaculty({ instructors }: StudioProgramFacultyProps) {
  return (
    <section
      className={`${styles.section} studio-light studio-band studio-wrap`}
      id="program-lecturers"
      aria-labelledby="program-lecturers-title"
    >
      <header className={styles.heading}>
        <p className="studio-label">Лектори</p>
        <h2 className="studio-title" id="program-lecturers-title">
          Хто вчить
        </h2>
      </header>
      <div className={styles.people}>
        {instructors.map((instructor) => (
          <article key={instructor.id} className={styles.person}>
            <StudioImage
              asset={instructor.asset}
              alt={instructor.alt}
              fit="cover"
              sizes="(max-width: 760px) 38vw, 20vw"
            />
            <div>
              <h3>{instructor.name}</h3>
              <p className={styles.role}>{instructor.role}</p>
              <p>{instructor.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
