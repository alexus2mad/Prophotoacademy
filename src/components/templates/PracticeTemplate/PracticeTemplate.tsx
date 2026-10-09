import { Photo } from '@/components/atoms/Photo/Photo';
import { InquiryButton } from '@/components/molecules/InquiryButton/InquiryButton';
import { ProgramPackages } from '@/components/organisms/ProgramPackages/ProgramPackages';
import { findImage } from '@/lib/content/selectors';
import { siteHref } from '@/lib/ecosystem';
import { money } from '@/lib/format';
import type { PracticeTemplateProps } from './types';
export function PracticeTemplate({
  session,
  content,
  ready,
  space,
  offering,
  program,
}: PracticeTemplateProps) {
  return (
    <div className="container hub-detail practice-detail">
      <section className="hub-detail-opening">
        <div>
          <p className="eyebrow">Практика · Київ</p>
          <h1>{session.title}</h1>
          <p className="lead">{session.description}</p>
          {ready ? (
            <p className="room-detail-price">
              {money(session.price!)} <span>· {session.duration}</span>
            </p>
          ) : (
            <p className="practice-stage">Готуємо формат · деталі після підтвердження</p>
          )}
          <InquiryButton
            practiceSessionId={session.id}
            title={ready ? 'Запит про контент-практику' : 'Повідомити про старт практики'}
          >
            {ready ? 'Запитати про практику' : 'Повідомити про старт'}
          </InquiryButton>
          <p className="practice-independent">
            Окрема платна практика. Участь у ній необов’язкова для проходження онлайн-курсу.
          </p>
        </div>
        <figure>
          <Photo image={findImage(content, session.imageId)} priority />
        </figure>
      </section>
      {offering &&
        program &&
        program.category === 'class' &&
        program.title === session.title &&
        offering.startDate === session.date &&
        offering.packages.some((pack) => pack.price === session.price) && (
          <ProgramPackages offering={offering} program={program} />
        )}
      <section className="room-detail-body">
        <div>
          <h2>{ready ? 'Як проходитиме практика' : 'Практика навколо вашого бренду'}</h2>
          <p>
            Зйомка для власного експертного бренду з підтримкою викладача. Розберемо ваш задум і
            застосуємо знання з курсу до конкретного контенту.
          </p>
          {ready ? (
            <dl className="practice-facts">
              <div>
                <dt>Дата</dt>
                <dd>
                  {new Intl.DateTimeFormat('uk-UA', {
                    dateStyle: 'long',
                    timeZone: 'Europe/Kyiv',
                  }).format(new Date(session.date!))}
                </dd>
              </div>
              <div>
                <dt>Група</dt>
                <dd>До {session.capacity} учасників</dd>
              </div>
            </dl>
          ) : (
            <p className="muted">
              Підтверджуємо викладача, тривалість, розмір групи, оснащення та вартість. Заявка
              означає інтерес до анонсу й не створює бронювання.
            </p>
          )}
        </div>
        <div>
          <h2>Де зустрінемось</h2>
          <p>
            {content.hub.address}
            <br />
            {content.hub.arrival}
          </p>
          <p className="muted">Простір ProPhoto Hub · {space.title}</p>
        </div>
      </section>
      {ready && (
        <section className="practice-delivery">
          {[
            ['Що підготувати', session.preparation],
            ['Обладнання', session.equipment],
            ['Що створите', session.deliverables],
          ].map(([title, items]) => (
            <div key={title as string}>
              <h2>{title as string}</h2>
              <ul>
                {(items as string[]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      <section className="practice-next">
        <h2>Почніть зі знань</h2>
        <p>«Інста, яка продає» — онлайн-курс зі створення контенту для свого експертного бренду.</p>
        <a
          href={siteHref('academy', 'course-smm-instagram')}
          className="text-link"
          data-ecosystem-target="academy"
        >
          Переглянути курс
        </a>
      </section>
    </div>
  );
}
