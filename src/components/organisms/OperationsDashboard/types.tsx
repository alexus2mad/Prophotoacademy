import type { customerOverview } from '@/lib/operations';
export type BaseOverview = ReturnType<typeof customerOverview>;
export type Overview = Omit<BaseOverview, 'customers'> & {
  customers: (BaseOverview['customers'][number] & {
    nextAction?: { label: string; href: string };
  })[];
};
