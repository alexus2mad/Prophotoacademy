import { AcademyDirectionCard } from '@/components/molecules/AcademyDirectionCard/AcademyDirectionCard';
import { DirectionCardMotion } from '@/components/behaviors/DirectionCardMotion/DirectionCardMotion';
import type { AcademyDirectionsProps } from './types';
export function AcademyDirections({ directions }: AcademyDirectionsProps) {
  return (
    <section
      id="courses"
      className="academy-design-directions"
      aria-labelledby="academy-directions-title"
    >
      <h2 id="academy-directions-title" className="academy-design-slogan">
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
      <DirectionCardMotion />
    </section>
  );
}
