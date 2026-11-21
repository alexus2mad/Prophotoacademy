import { StudioImage } from '@/components/atoms/StudioImage/StudioImage';
import { StudioCreatorHeading } from '@/components/molecules/StudioCreatorHeading/StudioCreatorHeading';
import type { StudioCreatorFacultyProps } from './types';
import styles from './StudioCreatorFaculty.module.css';

export function StudioCreatorFaculty({ instructors }: StudioCreatorFacultyProps) {
  return (
    <section
      id="program-lecturers"
      className={`${styles.section} studio-light studio-band studio-wrap`}
      aria-labelledby="program-lecturers-title"
    >
      <StudioCreatorHeading id="program-lecturers-title" label="Лектори курсу">
        Хто <span className="studio-hand">*вчить</span>
      </StudioCreatorHeading>
      <ul className={styles.people}>
        {instructors.map((instructor) => (
          <li
            className={styles.person}
            key={instructor.id}
            data-site-section={'lecturer-' + instructor.id}
          >
            {instructor.portrait ? (
              <div className={styles.portrait}>
                <StudioImage
                  asset={instructor.portrait}
                  fieldId="portrait"
                  alt={`Портрет: ${instructor.name}`}
                  className={styles.image}
                  fit="cover"
                  position="center 35%"
                  sizes="(max-width: 760px) 112px, (max-width: 1250px) 22vw, 280px"
                />
              </div>
            ) : (
              <div className={styles.portrait} aria-hidden="true" />
            )}
            <div className={styles.identity} data-has-biography={Boolean(instructor.bio)}>
              <h3 data-site-field="name">{instructor.name}</h3>
              <p className={styles.role}>
                {instructor.roles.map((role, index) => (
                  <span key={role} data-site-field={'role-' + index}>
                    {role}
                  </span>
                ))}
              </p>
            </div>
            {instructor.bio && (
              <p className={styles.biography} data-site-field="bio">
                {instructor.bio}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
