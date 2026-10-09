import { Disclosure } from '@/components/molecules/Disclosure/Disclosure';
import type { ProgramFaqsProps } from './types';
export function ProgramFaqs({ program }: ProgramFaqsProps) {
  return (
    <section>
      <h2>Відповіді перед стартом</h2>
      {program.faqs.map((faq) => (
        <Disclosure key={faq.question} title={faq.question}>
          <p>{faq.answer}</p>
        </Disclosure>
      ))}
    </section>
  );
}
