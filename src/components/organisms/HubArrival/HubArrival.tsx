import type { HubArrivalProps } from './types';
export function HubArrival({ hub }: HubArrivalProps) {
  return (
    <section className="container hub-arrival editorial-section">
      <div>
        <h2>Зустрінемось у центрі Києва</h2>
        <p>
          {hub.address}
          <br />
          {hub.arrival}
        </p>
        <a href={hub.mapsUrl} target="_blank" rel="noreferrer" className="text-link">
          Прокласти маршрут
        </a>
      </div>
      <div>
        <h3>Ваша зйомка — ваш простір</h3>
        <p>
          Оберіть залу для свого формату. Актуальну комплектацію, додаткове обладнання та готовність
          залів підтвердить команда студії.
        </p>
        <a href={`tel:${hub.phone}`} className="text-link">
          Поговорити про зйомку
        </a>
      </div>
    </section>
  );
}
