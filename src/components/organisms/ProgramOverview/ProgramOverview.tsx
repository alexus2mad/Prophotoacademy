import { Disclosure } from '@/components/molecules/Disclosure/Disclosure';
import type { ProgramOverviewProps } from './types';
export function ProgramOverview({ program }: ProgramOverviewProps) {
  return (
    <>
      <div className="program-overview-summary">
        <section aria-labelledby="program-outcomes-title">
          <h2 id="program-outcomes-title">Чого ви навчитеся</h2>
          <ul className="outcomes">
            {program.outcomes.map((outcome, i) => (
              <li key={outcome}>
                <span className="outcome-number">0{i + 1}</span>
                <span className="outcome-copy">{outcome}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="program-audience-title">
          <h2 id="program-audience-title">Для кого ця програма</h2>
          <ul className="audience-list">
            {program.audience.map((audience) => (
              <li key={audience}>{audience}</li>
            ))}
          </ul>
        </section>
      </div>
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
