import type { Pool, QueryResult, QueryResultRow } from 'pg';
export type DatabaseGlobals = { academyPool?: Pool };
export type SqlConnection = {
  query: <R extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[],
  ) => Promise<QueryResult<R>>;
};
export type JsonRow<T> = { data: T };
export type AuditInput = {
  actorId?: string;
  action: string;
  target: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
};
