// Client-safe addresses. The handoff leaves staging for the production editor's own session.
const production = 'https://prophotoacademy.com.ua';
const staging = 'https://staging.prophotoacademy.com.ua';

export const productionSyncHref = (path: string) =>
  production + '/admin/content?' + new URLSearchParams({ sync: path });
export const stagingPageHref = (path: string) => staging + path;
export const productionPageHref = (path: string) => production + path;
