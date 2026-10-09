export type CatalogFiltersProps = { type?: string; format?: string; level?: string; count: number };
export type CatalogFilterOptions = Pick<CatalogFiltersProps, 'format' | 'level'>;
