export type Acquisition = {
  site: 'academy' | 'hub';
  landingPath: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  fromSite?: 'academy' | 'hub';
};
