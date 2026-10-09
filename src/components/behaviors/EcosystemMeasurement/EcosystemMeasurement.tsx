'use client';
import Script from 'next/script';
import { useEcosystemMeasurement } from './hooks';
import type { EcosystemMeasurementProps } from './types';

export function EcosystemMeasurement({ site }: EcosystemMeasurementProps) {
  const { enabled, id, choice, setChoice, select, configure } = useEcosystemMeasurement({ site });
  if (!enabled) return null;
  return (
    <>
      {choice === 'allow' && (
        <Script
          id="prophoto-analytics"
          src={'https://www.googletagmanager.com/gtag/js?id=' + id}
          strategy="afterInteractive"
          onReady={configure}
        />
      )}
      <button className="analytics-preferences" onClick={() => setChoice(null)}>
        Налаштування аналітики
      </button>
      {choice === null && (
        <section className="analytics-consent" aria-label="Аналітика сайту">
          <p>Дозволити аналітику, щоб допомогти нам покращувати навчання та бронювання?</p>
          <div>
            <button className="button button-secondary button-small" onClick={() => select('deny')}>
              Без аналітики
            </button>
            <button className="button button-small" onClick={() => select('allow')}>
              Дозволити
            </button>
          </div>
        </section>
      )}
    </>
  );
}
