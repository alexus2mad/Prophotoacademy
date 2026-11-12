import { AcademyDirectionCard } from '@/components/molecules/AcademyDirectionCard/AcademyDirectionCard';
import type { AcademyDirectionsProps } from './types';
export function AcademyDirections({ directions }: AcademyDirectionsProps) {
  return (
    <section id="courses" className="academy-design-directions" aria-labelledby="education-id">
      <h2 id="education-id" className="academy-design-slogan">
        <span>
          Неважливо, <strong>на що ви знімаєте,</strong>
        </span>
        <span>
          <strong>важливо</strong> як ви це робите
        </span>
      </h2>
      <div className="academy-directions-grid">
        {directions.map((direction) => (
          <AcademyDirectionCard key={direction.title} direction={direction} />
        ))}
      </div>
    </section>
  );
}
