import { Photo } from '@/components/atoms/Photo/Photo';
import { findImage } from '@/lib/content/selectors';
import type { LearningSectionProps } from './types';
export function LearningSection({ content }: LearningSectionProps) {
  return (
    <section className="editorial-section learning-editorial container" data-editorial-reveal>
      <figure className="learning-photo">
        <Photo image={findImage(content, 'practice')} />
      </figure>
      <div className="learning-copy">
        <h2>Як ми навчаємо</h2>
        <ol className="learning-steps">
          <li>
            <span>01</span>
            <div>
              <h3>Зрозуміти</h3>
              <p>Світло, композицію та інструменти. Те, що допомагає створювати кадр свідомо.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Спробувати</h3>
              <p>
                Відпрацювати техніку на власних фото й відео. Обрати пакет із практикою та
                підтримкою.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Створювати своє</h3>
              <p>Знайти візуальну мову для особистих проєктів, контенту чи роботи з брендами.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
