import { Photo } from '@/components/atoms/Photo/Photo';
import { findImage } from '@/lib/content/selectors';
import type { ProgramInstructorsProps } from './types';
export function ProgramInstructors({ program, content }: ProgramInstructorsProps) {
  return (
    <section id="instructors">
      <h2>Ваші викладачі</h2>
      <div className="instructors-grid">
        {content.instructors
          .filter((i) => program.instructorIds.includes(i.id))
          .map((instructor) => (
            <article className="instructor-card" key={instructor.id}>
              <div className="instructor-photo">
                <Photo image={findImage(content, instructor.imageId)} />
              </div>
              <h3>{instructor.name}</h3>
              <p>{instructor.role}</p>
              <p>{instructor.bio}</p>
            </article>
          ))}
      </div>
    </section>
  );
}
