import type { SiteField, SitePage, SiteSection } from './types';
import { readField, siteField, siteSection } from './fields';

/** Define each editable slot once, for both the initial inventory and its public rendering. */
export function sectionBindings(page?: SitePage) {
  const sections: SiteSection[] = [];
  function section(id: string, label: string) {
    const fields: SiteField[] = [];
    sections.push(siteSection(id, label, fields));
    return (key: string, name: string, original: string, kind: SiteField['kind'] = 'text') => {
      fields.push(siteField(key, name, original, kind));
      return readField(page, id, key, original);
    };
  }
  return { sections, section };
}
