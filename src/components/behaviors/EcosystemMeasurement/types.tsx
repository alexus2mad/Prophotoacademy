declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
export type EcosystemMeasurementProps = { site: 'academy' | 'hub' };
export type AnalyticsChoice = 'allow' | 'deny';
