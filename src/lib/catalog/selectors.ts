import type { AcademyContent } from '../content/types';
import type { CatalogQuery } from './types';
import { findOffering } from '../content/selectors';
import { prioritizePrograms } from '../program-priority';
export function filterPrograms(content: AcademyContent, filters: CatalogQuery) {
  return prioritizePrograms(content.programs, content.settings.primaryProgramId).filter(
    (p) =>
      (!filters.type || p.category === filters.type) &&
      (!filters.level || p.level === filters.level || p.level === 'all') &&
      (!filters.format ||
        findOffering(content, p.id)?.format === filters.format ||
        findOffering(content, p.id)?.format === 'hybrid'),
  );
}
