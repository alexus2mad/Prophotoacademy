import { Disclosure } from '@/components/molecules/Disclosure/Disclosure';
import type { ProgramOverviewProps } from './types';
export function ProgramOverview({ program }: ProgramOverviewProps) {
  return (
    <>
      <section className="program-outcomes" aria-labelledby="program-outcomes-title">
        <h2 id="program-outcomes-title">Чого ви навчитеся</h2>
        <ul className="outcomes">
          {program.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </section>
      <section className="program-audience" aria-labelledby="program-audience-title">
        <h2 id="program-audience-title">Для кого ця програма</h2>
        <ul className="audience-list">
          {program.audience.map((audience) => (
            <li key={audience}>{audience}</li>
          ))}
        </ul>
      </section>
      {!!program.modules.length && (
        <section className="program-curriculum" aria-labelledby="program-curriculum-title">
          <h2 id="program-curriculum-title">Що будемо вивчати</h2>
          <div className="program-curriculum-modules">
            {program.modules.map((module, i) => (
              <Disclosure key={module.title} title={module.title} open={i === 0}>
                <ul>
                  {module.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </Disclosure>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
