import { Disclosure } from '@/components/molecules/Disclosure/Disclosure';
import { Check } from 'lucide-react';
import type { ProgramOverviewProps } from './types';
export function ProgramOverview({ program }: ProgramOverviewProps) {
  return (
    <>
      <section>
        <h2>Чого ви навчитеся</h2>
        <ul className="outcomes">
          {program.outcomes.map((outcome, i) => (
            <li key={outcome}>
              <span className="outcome-number">0{i + 1}</span>
              <span className="outcome-copy">{outcome}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Для кого ця програма</h2>
        <ul className="audience-list">
          {program.audience.map((a) => (
            <li key={a}>
              <Check />
              {a}
            </li>
          ))}
        </ul>
      </section>
      {!!program.modules.length && (
        <section>
          <h2>Що будемо вивчати</h2>
          {program.modules.map((module, i) => (
            <Disclosure key={module.title} title={module.title} open={i === 0}>
              <ul>
                {module.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </Disclosure>
          ))}
        </section>
      )}
    </>
  );
}
